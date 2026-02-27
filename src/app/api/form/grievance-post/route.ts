import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import fs from "fs/promises";
import path from "path";
import { transporter } from "../../../../../lib/emailService";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ApprovalStepApprover, Prisma, User } from "@/generated/client";

const emailFrom = process.env.EMAIL;
const webLink = process.env.NEXTAUTH_URL;

type ManualApproverWithUser = ApprovalStepApprover & { user: User };

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

    const findHeadofDepartment = await prisma.user.findFirst({
      where: {
        departmentId: findDepartment.id,
        role: "HEAD_OF_DEPARTMENT",
      },
    });

    if (!findHeadofDepartment) {
      return NextResponse.json(
        { error: "Head of Department is missing" },
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
          filePath: `/uploads/${fileName}`,
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
      let approvers: User[] = [];

      // Load manual approvers if any
      const manualApprovers = await prisma.approvalStepApprover.findMany({
        where: { stepId: step.id },
        include: { user: true },
      });

      if (manualApprovers.length) {
        approvers = manualApprovers.map((a) => a.user);
      } else if (step.order === 1) {
        // Step 1: TO = HOD, CC = HODiv (both can approve)
        if (!findUser.departmentId) throw new Error("User has no departmentId");

        const hod = await prisma.user.findFirst({
          where: {
            role: "HEAD_OF_DEPARTMENT",
            departmentId: findUser.departmentId,
          },
        });

        if (!hod) throw new Error("Head of Department not found");

        approvers.push(hod);

        if (findUser.divisionId) {
          const hodiv = await prisma.user.findFirst({
            where: {
              role: "HEAD_OF_DIVISION",
              divisionId: findUser.divisionId,
            },
          });
          if (hodiv) approvers.push(hodiv);
        }
      } else {
        // Steps > 1: find by role/department/division/section
        const baseWhere: Prisma.UserWhereInput = {
          role: step.role,
          id: { notIn: assignedApprovers },
        };

        if (step.divisionId !== null) baseWhere.divisionId = step.divisionId;
        if (step.departmentId !== null)
          baseWhere.departmentId = step.departmentId;
        if (step.sectionId !== null) baseWhere.sectionId = step.sectionId;

        approvers = await prisma.user.findMany({ where: baseWhere });
      }

      // Remove duplicates
      approvers = approvers.filter((a) => !assignedApprovers.includes(a.id));
      assignedApprovers.push(...approvers.map((a) => a.id));

      const DAY = 24 * 60 * 60 * 1000;
      // Create approvals (all as PENDING)
      await prisma.approval.createMany({
        data: approvers.map((u) => ({
          submissionId: formSubmission.id,
          approverId: u.id,
          stepOrder: step.order,
          status: step.order === 1 ? "PENDING" : "WAITING",
          deadline: step.order === 1 ? new Date(Date.now() + 5 * DAY) : null,
          escalated: false,
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
        requestLink: `${webLink}/dashboard/approval?id=${formSubmission.id}&name=${formType.name}`,
        isApprover: false,
      },
    };

    await transporter.sendMail(mailOptions);

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
          approvalLink: `${webLink}/dashboard/approval?id=${formSubmission.id}&name=${formType.name}`,
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

async function resolveStep1Approvers(user: User) {
  if (!user.departmentId) {
    throw new Error("User has no departmentId for step 1");
  }

  // Head of Department (TO)
  const hod = await prisma.user.findFirst({
    where: { role: "HEAD_OF_DEPARTMENT", departmentId: user.departmentId },
  });

  if (!hod) {
    throw new Error("Head of Department not found for user's department");
  }

  // Head of Division (CC)
  const hodiv = user.divisionId
    ? await prisma.user.findFirst({
        where: { role: "HEAD_OF_DIVISION", divisionId: user.divisionId },
      })
    : null;

  return {
    to: hod,
    cc: hodiv ? [hodiv] : [],
  };
}
