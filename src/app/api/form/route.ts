import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("fileAttachment") as File | null;
    const user = JSON.parse(formData.get("user") as string);
    const formId = Number(formData.get("formId"));
    const data = JSON.parse(formData.get("data") as string);

    console.log("file: ", file);

    console.log("formId: ", formId);

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
        formData: data, // ✅ store your form data JSON
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

      // Save file metadata in FileAttachment table
      await prisma.fileAttachment.create({
        data: {
          formSubmissionId: formSubmission.id,
          fileName: fileName,
          filePath: `/uploads/${fileName}`, // relative public path
          fileType: file.type || "unknown",
        },
      });
    }

    const approvalFlowSteps = await prisma.approvalFlowStep.findMany({
      where: { formTypeId: formId },
      orderBy: { order: "asc" },
    });

    if (approvalFlowSteps.length === 0) {
      console.warn(`⚠️ No approval flow steps found for formTypeId: ${formId}`);
    }

    for (const step of approvalFlowSteps) {
      // Find approvers matching the step config
      const approvers = await prisma.user.findMany({
        where: {
          role: step.role,
          ...(step.departmentId && { departmentId: step.departmentId }),
          ...(step.divisionId && { divisionId: step.divisionId }),
          ...(step.sectionId && { sectionId: step.sectionId }),
        },
      });

      if (approvers.length === 0) {
        console.warn(
          `⚠️ No approvers found for role ${step.role} in step ${step.order}`
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
              status: step.order === 1 ? "PENDING" : "WAITING", // Only step 1 active
            },
          })
        )
      );
    }

    const createdApprovals = await prisma.approval.findMany({
      where: { submissionId: formSubmission.id },
      include: { approver: true },
    });

    console.log("✅ Created approvals:", createdApprovals);

    return NextResponse.json(
      { message: "Record has been created successfully", data: formSubmission },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating form record:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
