import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { transporter } from "../../../../../lib/emailService";

const emailFrom = process.env.EMAIL;
const webLink = process.env.NEXTAUTH_URL;

export async function POST(req: NextRequest) {
  try {
    const { approvalId, action, remarks } = await req.json();

    if (!approvalId || !action)
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );

    // 1️⃣ Find approval + submission + user + all approvals
    const approval = await prisma.approval.findUnique({
      where: { id: Number(approvalId) },
      include: {
        approver: true, // to get approver name/email
        submission: {
          include: {
            approvals: {
              include: { approver: true },
            },
            createdBy: true, // assuming relation to User
          },
        },
      },
    });

    if (!approval)
      return NextResponse.json(
        { error: "Approval not found" },
        { status: 404 }
      );

    const submission = approval.submission;
    const submissionId = submission.id;
    const requestor = submission.createdBy;

    const formType = await prisma.formType.findUnique({
      where: {
        id: Number(submission.formTypeId),
      },
    });

    if (!formType) {
      return NextResponse.json(
        { error: "Form type not found" },
        { status: 400 }
      );
    }

    const findDepartment = await prisma.department.findUnique({
      where: {
        id: Number(requestor.departmentId),
      },
    });

    if (!findDepartment) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 400 }
      );
    }

    // 2️⃣ Update current approval
    await prisma.approval.update({
      where: { id: approval.id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        remarks: remarks || null,
        approvedAt: new Date(),
      },
    });

    // 3️⃣ Handle next step
    const nextStep = submission.approvals.find(
      (a) => a.stepOrder === approval.stepOrder + 1
    );

    if (action === "approve") {
      if (nextStep) {
        // Next approver pending
        await prisma.approval.updateMany({
          where: { submissionId, stepOrder: approval.stepOrder + 1 },
          data: { status: "PENDING" },
        });

        const mailOptions = {
          from: emailFrom,
          to: nextStep.approver.email,
          subject: "Action Required: Request Pending Your Approval",
          template: "nextApproval",
          context: {
            nextApproverName: nextStep.approver.fullname,
            previousApproverName: approval.approver.fullname,
            formTitle: formType.name,
            requestorName: requestor.fullname,
            requestorStaffId: requestor.staffid,
            department: findDepartment.name,
            submittedAt: submission.createdAt.toLocaleString(),
            status: "Pending Approval",
            approvalLink: `${webLink}/dashboard/approval?id=${submissionId}&name=${formType.name}`,
          },
        };

        await transporter.sendMail(mailOptions);
      } else {
        // ✅ Final approval
        await prisma.formSubmission.update({
          where: { id: submissionId },
          data: { status: "APPROVED" },
        });

        const mailOptions = {
          from: emailFrom,
          to: requestor.email,
          subject: "Your Request Has Been Approved",
          template: "finalApproval",
          context: {
            status: "APPROVED",
            formTitle: formType.name,
            requestorName: requestor.fullname,
            requestorStaffId: requestor.staffid,
            submittedAt: submission.createdAt.toLocaleString(),
            department: findDepartment.name,
            finalApproverName: "amir",
            requestLink: `${webLink}/dashboard/approval?id=${submissionId}&name=${formType.name}`,
          },
        };

        await transporter.sendMail(mailOptions);
      }
    } else {
      // ❌ Rejected
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: { status: "REJECTED" },
      });

      await prisma.approval.updateMany({
        where: { submissionId, stepOrder: { gt: approval.stepOrder } },
        data: { status: "REJECTED" },
      });

      const mailOptions = {
        from: emailFrom,
        to: requestor.email,
        subject: "Your Request Has Been Rejected",
        template: "rejectRequest",
        context: {
          status: "REJECTED",
          formTitle: formType.name,
          requestorName: requestor.fullname,
          requestorStaffId: requestor.staffid,
          submittedAt: submission.createdAt.toLocaleString(),
          department: findDepartment.name,
          rejectedBy: "amir",
          requestLink: `${webLink}/dashboard/approval?id=${submissionId}&name=${formType.name}`,
        },
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ message: "Action processed successfully" });
  } catch (error) {
    console.error("Approval action error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
