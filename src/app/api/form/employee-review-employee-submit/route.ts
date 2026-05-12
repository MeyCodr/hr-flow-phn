import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { transporter } from "../../../../../lib/emailService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-options";

const emailFrom = process.env.EMAIL;
const webLink = process.env.NEXTAUTH_URL;
// Human Capital and ESG division id (from seed)
const HCD_DIVISION_ID = 6;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { formSubmissionId, user, employeeComments } = await req.json();

    if (!formSubmissionId || !user) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { staffid: user.staffid.toString() },
    });
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const submission = await prisma.formSubmission.findUnique({
      where: { id: Number(formSubmissionId) },
      include: { formType: true, createdBy: true },
    });
    if (!submission) {
      return NextResponse.json({ error: "Form submission not found" }, { status: 404 });
    }

    const formData = submission.formData as Record<string, unknown> | null;
    const reviewStage = formData?.reviewStage as string | undefined;

    if (reviewStage !== "HOD_APPROVED") {
      return NextResponse.json({ error: "Form is not awaiting employee comments" }, { status: 400 });
    }

    // Validate the submitter IS the reviewed employee
    const employeeStaffId = formData?.staffId as string | undefined;
    if (employeeStaffId && currentUser.staffid !== employeeStaffId) {
      return NextResponse.json({ error: "Only the reviewed employee can submit comments" }, { status: 403 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Update form data with employee comments, signature, date
    await prisma.formSubmission.update({
      where: { id: Number(formSubmissionId) },
      data: {
        formData: {
          ...(formData ?? {}),
          employeeComments: employeeComments ?? "",
          employeeSignature: currentUser.fullname,
          employeeDate: today,
          reviewStage: "EMPLOYEE_SUBMITTED",
        },
      },
    });

    // Mark the employee's own approval entry as APPROVED
    await prisma.approval.updateMany({
      where: {
        submissionId: Number(formSubmissionId),
        approverId: currentUser.id,
        status: "PENDING",
      },
      data: { status: "APPROVED", approvedAt: new Date() },
    });

    // Activate the next WAITING approval step (HCD) if already configured
    const nextWaiting = await prisma.approval.findFirst({
      where: { submissionId: Number(formSubmissionId), status: "WAITING" },
      orderBy: { stepOrder: "asc" },
    });

    if (nextWaiting) {
      // Activate ALL approvers at this step order (first TO, rest CC)
      const stepApprovals = await prisma.approval.findMany({
        where: { submissionId: Number(formSubmissionId), stepOrder: nextWaiting.stepOrder },
        include: { approver: true },
      });

      await prisma.approval.updateMany({
        where: { submissionId: Number(formSubmissionId), stepOrder: nextWaiting.stepOrder },
        data: { status: "PENDING" },
      });

      const [first, ...rest] = stepApprovals;
      const hcdStepMail = {
        from: emailFrom,
        to: first.approver.email,
        cc: rest.map((a) => a.approver.email),
        subject: "Action Required: Performance Review Pending Acknowledgement",
        template: "FormSubmission",
        context: {
          subject: "Action Required: Performance Review Pending Your Acknowledgement",
          recipientName: first.approver.fullname,
          formTitle: submission.formType.name,
          requestorName: submission.createdBy.fullname,
          requestorStaffId: submission.createdBy.staffid,
          department: "",
          submittedAt: submission.createdAt.toLocaleString(),
          status: "Pending Acknowledgement",
          approvalLink: `${webLink}/dashboard/approval?id=${formSubmissionId}&name=${submission.formType.name}`,
          isApprover: true,
        },
      };
      try { await transporter.sendMail(hcdStepMail); } catch { /* non-fatal */ }
    } else {
      // No pre-configured HCD step — find HCD approver dynamically from Human Capital division
      const hcdApprovers = await prisma.user.findMany({
        where: {
          divisionId: HCD_DIVISION_ID,
          role: "HEAD_OF_DIVISION",
        },
        take: 3,
      });

      if (hcdApprovers.length === 0) {
        return NextResponse.json({ error: "No HCD approver found" }, { status: 400 });
      }

      const maxStep = await prisma.approval.aggregate({
        where: { submissionId: Number(formSubmissionId) },
        _max: { stepOrder: true },
      });
      const nextStepOrder = (maxStep._max.stepOrder ?? 0) + 1;

      await prisma.approval.createMany({
        data: hcdApprovers.map((approver, index) => ({
          submissionId: Number(formSubmissionId),
          approverId: approver.id,
          stepOrder: nextStepOrder,
          status: index === 0 ? "PENDING" : "WAITING",
        })),
      });

      // Email the first HCD approver
      const hcdDynamicMail = {
        from: emailFrom,
        to: hcdApprovers[0].email,
        subject: "Action Required: Performance Review Pending Acknowledgement",
        template: "FormSubmission",
        context: {
          subject: "Action Required: Performance Review Pending Your Acknowledgement",
          recipientName: hcdApprovers[0].fullname,
          formTitle: submission.formType.name,
          requestorName: submission.createdBy.fullname,
          requestorStaffId: submission.createdBy.staffid,
          department: "",
          submittedAt: submission.createdAt.toLocaleString(),
          status: "Pending Acknowledgement",
          approvalLink: `${webLink}/dashboard/approval?id=${formSubmissionId}&name=${submission.formType.name}`,
          isApprover: true,
        },
      };
      try { await transporter.sendMail(hcdDynamicMail); } catch { /* non-fatal */ }
    }

    return NextResponse.json({ message: "Employee comments submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Employee review submit error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
