import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import fs from "fs/promises";
import path from "path";
import { transporter } from "../../../../../lib/emailService";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Prisma } from "@prisma/client";

const emailFrom = process.env.EMAIL;
const webLink = process.env.NEXTAUTH_URL;

console.log("email from: ", emailFrom);

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

    console.log("file: ", file);
    console.log("user: ", user);
    console.log("formId: ", formId);
    console.log("data: ", data);

    // ✅ Validate user
    if (!user) {
      return NextResponse.json(
        { error: "User session is missing" },
        { status: 400 }
      );
    }

    const staffid = user.staffid;
    if (!staffid) {
      return NextResponse.json(
        { error: "Staff id is missing" },
        { status: 400 }
      );
    }

    const findUser = await prisma.user.findUnique({
      where: { staffid: staffid.toString() },
    });

    if (!findUser) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
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
        { status: 400 }
      );
    }

    const findDepartment = await prisma.department.findUnique({
      where: { id: Number(findUser.departmentId) },
    });

    if (!findDepartment) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 400 }
      );
    }

    const formType = await prisma.formType.findUnique({
      where: { id: formId },
    });

    if (!formType) {
      return NextResponse.json(
        { error: `Invalid form type ID: ${formId}` },
        { status: 400 }
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
      const uploadDir = path.join(process.cwd(), "public/uploads");
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
      let approver = null;

      const baseWhere: Prisma.UserWhereInput = {
        role: step.role,
        id: { notIn: assignedApprovers }, // ✅ EXCLUDE already assigned approvers
      };

      // ✅ Dynamic lookup based on flow config
      if (step.divisionId !== null) {
        baseWhere.divisionId = Number(step.divisionId);
      } else if (step.departmentId !== null) {
        baseWhere.departmentId = Number(step.departmentId);
      } else if (step.sectionId !== null) {
        baseWhere.sectionId = Number(step.sectionId);
      } else {
        baseWhere.divisionId = findUser.divisionId; // fallback to requester division
      }

      approver = await prisma.user.findFirst({
        where: baseWhere,
        orderBy: { id: "asc" }, // deterministic
      });

      if (!approver) {
        console.warn(
          `⚠️ No approver found for Role=${step.role} at step ${step.order}`
        );
        continue;
      }

      assignedApprovers.push(approver.id);

      await prisma.approval.create({
        data: {
          submissionId: formSubmission.id,
          approverId: approver.id,
          stepOrder: step.order,
          status: step.order === 1 ? "PENDING" : "WAITING",
          deadline:
            step.order === 1
              ? //   ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
                new Date(Date.now() + 5 * 60 * 1000)
              : null,
          escalated: false, // add the escalated flag
        },
      });
    }

    // ✅ Fetch the first-step approvers (order = 1)
    const firstStepApprovers = await prisma.approval.findMany({
      where: { submissionId: formSubmission.id, stepOrder: 1 },
      include: { approver: true },
    });

    console.log("✅ Created approvals:", firstStepApprovers);
    console.log("head o division: ", headOfDivision);

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

    for (const approval of firstStepApprovers) {
      const approvalMail = {
        from: emailFrom,
        to: approval.approver.email,
        cc: headOfDivision?.email || undefined,
        subject: "Action Required: New Request Pending Your Approval",
        template: "FormSubmission",
        context: {
          subject: "Action Required: New Request Pending Your Approval",
          recipientName: approval.approver.fullname,
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
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating form record:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
