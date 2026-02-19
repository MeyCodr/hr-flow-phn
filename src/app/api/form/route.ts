import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import fs from "fs/promises";
import path from "path";
import { transporter } from "../../../../lib/emailService";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { ApprovalStepApprover, Prisma, User } from "@/generated/client";

const emailFrom = process.env.EMAIL;
const webLink = process.env.NEXTAUTH_URL;

type ManualApproverWithUser = ApprovalStepApprover & { user: User };
type FormData = {
  division: string;
  department: string;
  section: string;
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();

    const file = formData.get("fileAttachment") as File | null;
    const user = JSON.parse(formData.get("user") as string);
    const formId = Number(formData.get("formId"));
    const data = JSON.parse(formData.get("data") as string);

    // ✅ Validate user
    if (!user) {
      return NextResponse.json(
        { error: "User session is missing" },
        { status: 400 },
      );
    }

    const staffid = user.staffid;
    if (!staffid) {
      return NextResponse.json(
        { error: "Staff id is missing" },
        { status: 400 },
      );
    }

    const findUser = await prisma.user.findUnique({
      where: { staffid: staffid.toString() },
    });

    if (!findUser) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 },
      );
    }

    // // ✅ Find Head of Division
    const headOfDivision = await prisma.user.findFirst({
      where: {
        divisionId: findUser.divisionId,
        role: "HEAD_OF_DIVISION",
      },
    });

    if (!headOfDivision) {
      return NextResponse.json(
        { error: "Head of Division not found" },
        { status: 400 },
      );
    }

    const findDepartment = await prisma.department.findUnique({
      where: { id: Number(findUser.departmentId) },
    });

    if (!findDepartment) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 400 },
      );
    }

    const formType = await prisma.formType.findUnique({
      where: { id: formId },
    });

    if (!formType) {
      return NextResponse.json(
        { error: `Invalid form type ID: ${formId}` },
        { status: 400 },
      );
    }

    // ✅ Create Form Submission
    const formSubmission = await prisma.formSubmission.create({
      data: {
        formTypeId: formId,
        createdById: findUser.id,
        status: "PENDING",
        formData: data,
      },
    });

    // ✅ Handle file upload (optional)
    if (file) {
      const uploadDir = path.join(process.cwd(), "storage/uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await fs.writeFile(filePath, buffer);

      // Save file metadata
      await prisma.fileAttachment.create({
        data: {
          formSubmissionId: formSubmission.id,
          fileName: fileName,
          filePath: `/storage/uploads/${fileName}`,
          fileType: file.type || "unknown",
        },
      });
    }

    // ✅ Fetch Approval Flow Steps for this form
    const approvalFlowSteps = await prisma.approvalFlowStep.findMany({
      where: { formTypeId: formId },
      orderBy: { order: "asc" },
    });

    if (approvalFlowSteps.length === 0) {
      console.warn(`⚠️ No approval flow steps found for formTypeId: ${formId}`);
    }

    const assignedApprovers: number[] = [];

    for (const step of approvalFlowSteps) {
      const baseWhere: Prisma.UserWhereInput = {
        role: step.role,
        id: { notIn: assignedApprovers },
      };

      if (step.divisionId !== null) {
        baseWhere.divisionId = Number(step.divisionId);
      }

      if (step.departmentId !== null) {
        baseWhere.departmentId = Number(step.departmentId);
      }

      if (step.sectionId !== null) {
        baseWhere.sectionId = Number(step.sectionId);
      }

      // fallback only if NOTHING is defined
      if (
        step.divisionId === null &&
        step.departmentId === null &&
        step.sectionId === null
      ) {
        baseWhere.divisionId = findUser.divisionId;
      }

      // 1️⃣ Load manual approvers
      const manualApprovers = await prisma.approvalStepApprover.findMany({
        where: { stepId: step.id },
        include: { user: true },
      });

      console.log("Manual Approvers:", manualApprovers);

      let approvers = manualApprovers.length
        ? manualApprovers.map((a: ManualApproverWithUser) => a.user)
        : await prisma.user.findMany({ where: baseWhere });

      // 2️⃣ Add Head of Division automatically ONLY for step 1
      // if (step.order === 1 && headOfDivision) {
      //   approvers.push(headOfDivision);
      // }

      // Prevent duplicates
      approvers = approvers.filter(
        (a: User) => !assignedApprovers.includes(a.id),
      );

      assignedApprovers.push(...approvers.map((a: User) => a.id));

      // 3️⃣ Create all approvals for this step with deadline for step 1
      await prisma.approval.createMany({
        data: approvers.map((u: User) => ({
          submissionId: formSubmission.id,
          approverId: u.id,
          stepOrder: step.order,
          status: step.order === 1 ? "PENDING" : "WAITING",
          // deadline: step.order === 1 ? new Date(Date.now() + 5 * 60 * 1000) : null,
          // escalated: false,
        })),
      });
    }

    // ✅ Fetch the first-step approvers (order = 1)
    const firstStepApprovers = await prisma.approval.findMany({
      where: { submissionId: formSubmission.id, stepOrder: 1 },
      include: { approver: true },
    });

    const mailOptions = {
      from: emailFrom,
      to: findUser.email,
      subject: "Form request has been submitted",
      template: "FormSubmission",
      context: {
        subject: "Your Request Has Been Submitted and Is Pending Approval",
        recipientName: findUser?.fullname,
        formTitle: formType?.name,
        requestorName: findUser?.fullname,
        requestorStaffId: findUser?.staffid,
        department: findDepartment?.name,
        submittedAt: new Date(formSubmission.createdAt).toLocaleString(),
        status: formSubmission.status,
        requestLink: `${webLink}/approval?id=${formSubmission.id}&name=${formType.name}`,
        isApprover: false,
      },
    };

    await transporter.sendMail(mailOptions);

    // ✅ Updated email logic: First approver in TO, others in CC
    if (firstStepApprovers.length > 0) {
      // The first approver goes to TO, rest go to CC
      const [firstApprover, ...otherApprovers] = firstStepApprovers;

      const approvalMail = {
        from: emailFrom,
        to: firstApprover.approver.email,
        cc: otherApprovers.map(
          (a: { approver: { email: string } }) => a.approver.email,
        ),
        subject: "Action Required: New Request Pending Your Approval",
        template: "FormSubmission",
        context: {
          subject: "Action Required: New Request Pending Your Approval",
          recipientName: firstApprover.approver.fullname,
          formTitle: formType?.name,
          requestorName: findUser?.fullname,
          requestorStaffId: findUser?.staffid,
          department: findDepartment?.name,
          submittedAt: new Date(formSubmission.createdAt).toLocaleString(),
          status: formSubmission.status,
          approvalLink: `${webLink}/approval?id=${formSubmission.id}&name=${formType.name}`,
          isApprover: true,
        },
      };

      await transporter.sendMail(approvalMail);
    }

    return NextResponse.json(
      {
        message: "Form and approvals created successfully",
        data: formSubmission,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating form record:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch form submissions with createdBy and approvals
    const submissions = await prisma.formSubmission.findMany({
      include: {
        attachments: true,
        createdBy: true,
        formType: true,
        approvals: {
          include: {
            approver: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map to flatten division, department, section names
    const mapped = await Promise.all(
      submissions.map(async (sub: (typeof submissions)[number]) => {
        const parsedFormData: FormData =
          typeof sub.formData === "string"
            ? JSON.parse(sub.formData)
            : (sub.formData as FormData);

        // Fetch related names
        const [division, department, section] = await Promise.all([
          Number(parsedFormData.division)
            ? prisma.division.findUnique({
                where: { id: Number(parsedFormData.division) },
              })
            : null,
          Number(parsedFormData.department)
            ? prisma.department.findUnique({
                where: { id: Number(parsedFormData.department) },
              })
            : null,
          Number(parsedFormData.section)
            ? prisma.section.findUnique({
                where: { id: Number(parsedFormData.section) },
              })
            : null,
        ]);

        return {
          ...sub,
          departmentName: department?.name || null,
          divisionName: division?.name || null,
          sectionName: section?.name || null,
        };
      }),
    );

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Error fetching form submissions:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
