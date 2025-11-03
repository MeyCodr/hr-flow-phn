import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import fs from "fs/promises";
import path from "path";
import { transporter } from "../../../../lib/emailService";

const emailFrom = process.env.EMAIL;
const webLink = process.env.NEXTAUTH_URL;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("fileAttachment") as File | null;
    const user = JSON.parse(formData.get("user") as string);
    const formId = Number(formData.get("formId"));
    const data = JSON.parse(formData.get("data") as string);

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

    // ✅ Process each approval step
    for (const step of approvalFlowSteps) {
      let approvers = [];

      switch (step.role) {
        case "HEAD_OF_DIVISION":
          approvers = await prisma.user.findMany({
            where: {
              role: step.role,
              divisionId: step.divisionId ?? findUser.divisionId, // dynamic or static
            },
          });
          break;

        case "HEAD_OF_DEPARTMENT":
          approvers = await prisma.user.findMany({
            where: {
              role: step.role,
              departmentId: step.departmentId ?? findUser.departmentId,
            },
          });
          break;

        case "HEAD_OF_SECTION":
          approvers = await prisma.user.findMany({
            where: {
              role: step.role,
              sectionId: step.sectionId ?? findUser.sectionId,
            },
          });
          break;

        default:
          approvers = await prisma.user.findMany({
            where: {
              role: step.role,
              divisionId: step.divisionId ?? findUser.divisionId,
            },
          });
          break;
      }

      if (approvers.length === 0) {
        console.warn(
          `⚠️ No approvers found for ${step.role} in step ${step.order}`
        );
        continue;
      }

      // ✅ Create approvals for all approvers in this step
      await Promise.all(
        approvers.map((approver) =>
          prisma.approval.create({
            data: {
              submissionId: formSubmission.id,
              approverId: approver.id,
              stepOrder: step.order,
              status: step.order === 1 ? "PENDING" : "WAITING",
            },
          })
        )
      );
    }

    // const createdApprovals = await prisma.approval.findMany({
    //   where: { submissionId: formSubmission.id },
    //   include: { approver: true },
    // });

    // ✅ Fetch the first-step approvers (order = 1)
    const firstStepApprovers = await prisma.approval.findMany({
      where: { submissionId: formSubmission.id, stepOrder: 1 },
      include: { approver: true },
    });

    console.log("✅ Created approvals:", firstStepApprovers);

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

    for (const approval of firstStepApprovers) {
      const approvalMail = {
        from: emailFrom,
        to: approval.approver.email,
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
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating form record:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function GET(){
  try{
    const getAllFormSubmission = await prisma.formSubmission.findMany();
    return NextResponse.json(getAllFormSubmission);
  }catch(error){
    return NextResponse.json({error: error}, {status: 500})
  }
}