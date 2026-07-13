import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import fs from "fs/promises";
import path from "path";
import { transporter } from "../../../../../lib/emailService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-options";
import { Prisma, User } from "@/generated/client";
import { getGrievanceStepDeadline } from "../../../../../lib/grievance-deadline";

const emailFrom = process.env.EMAIL;
const webLink = process.env.NEXTAUTH_URL;

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

    // ✅ Resolve all approvers BEFORE creating the submission so we can fail early
    const approvalFlowSteps = await prisma.approvalFlowStep.findMany({
      where: { formTypeId: formId },
      orderBy: { order: "asc" },
    });

    if (approvalFlowSteps.length === 0) {
      return NextResponse.json(
        { error: "No approval flow configured for this form type" },
        { status: 400 },
      );
    }

    const resolvedSteps: { step: typeof approvalFlowSteps[number]; approvers: User[] }[] = [];
    const seenApproverIds: number[] = [];
    let fallbackRoleUsed: string | null = null;

    for (const step of approvalFlowSteps) {
      let approvers: User[] = [];

      const manualApprovers = await prisma.approvalStepApprover.findMany({
        where: { stepId: step.id },
        include: { user: true },
      });

      if (manualApprovers.length) {
        approvers = manualApprovers.map((a) => a.user);
      } else {
        // If a previous step already covered this role via fallback, skip it
        if (fallbackRoleUsed === step.role) {
          continue;
        }

        // Resolve by step.role, scoped to the step's explicit org unit or the submitter's hierarchy
        const baseWhere: Prisma.UserWhereInput = {
          role: step.role,
          id: { notIn: seenApproverIds },
        };

        if (step.divisionId !== null) {
          baseWhere.divisionId = step.divisionId;
        } else if (step.role === "HEAD_OF_DIVISION" && findUser.divisionId) {
          baseWhere.divisionId = findUser.divisionId;
        }

        if (step.departmentId !== null) {
          baseWhere.departmentId = step.departmentId;
        } else if (step.role === "HEAD_OF_DEPARTMENT" && findUser.departmentId) {
          baseWhere.departmentId = findUser.departmentId;
        }

        if (step.sectionId !== null) {
          baseWhere.sectionId = step.sectionId;
        } else if (step.role === "HEAD_OF_SECTION" && findUser.sectionId) {
          baseWhere.sectionId = findUser.sectionId;
        }

        approvers = await prisma.user.findMany({ where: baseWhere });

        // Fallback: if no HEAD_OF_SECTION found, use HEAD_OF_DEPARTMENT from submitter's department
        if (approvers.length === 0 && step.role === "HEAD_OF_SECTION") {
          if (findUser.departmentId) {
            approvers = await prisma.user.findMany({
              where: {
                role: "HEAD_OF_DEPARTMENT",
                departmentId: findUser.departmentId,
                id: { notIn: seenApproverIds },
              },
            });
            if (approvers.length > 0) {
              // Mark HEAD_OF_DEPARTMENT as used so the dedicated HOD step is skipped
              fallbackRoleUsed = "HEAD_OF_DEPARTMENT";
            }
          }
        }
      }

      // Deduplicate across steps
      approvers = approvers.filter((a) => !seenApproverIds.includes(a.id));

      if (approvers.length === 0) {
        const roleLabel = step.role.replace(/_/g, " ").toLowerCase();
        const missingSection = !findUser.sectionId ? " (user has no section assigned)" : "";
        const missingDept = !findUser.departmentId ? " (user has no department assigned)" : "";
        return NextResponse.json(
          {
            error: `No approver found for step ${step.order} (${roleLabel})${missingSection || missingDept}. Please ensure the approver is assigned and has the correct role.`,
          },
          { status: 400 },
        );
      }

      seenApproverIds.push(...approvers.map((a) => a.id));
      resolvedSteps.push({ step, approvers });
    }

    // ✅ All approvers resolved — safe to create the submission
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

      await prisma.fileAttachment.create({
        data: {
          formSubmissionId: formSubmission.id,
          fileName: fileName,
          filePath: `/uploads/${fileName}`,
          fileType: file.type || "unknown",
        },
      });
    }

    // ✅ Create approvals using the pre-resolved steps
    const firstStepOrder = resolvedSteps[0].step.order;
    const lastStepOrder = resolvedSteps[resolvedSteps.length - 1].step.order;

    for (const { step, approvers } of resolvedSteps) {
      const isFirstStep = step.order === firstStepOrder;
      const isLastStep = step.order === lastStepOrder;
      await prisma.approval.createMany({
        data: approvers.map((u) => ({
          submissionId: formSubmission.id,
          approverId: u.id,
          stepOrder: step.order,
          status: isFirstStep ? "PENDING" : "WAITING",
          deadline: isFirstStep ? getGrievanceStepDeadline(step.order, isLastStep) : null,
          escalated: false,
        })),
      });
    }

    // ✅ Fetch the first-step approvers for email notification
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

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.error("Failed to send submission confirmation email:", mailErr);
    }

    if (firstStepApprovers.length > 0) {
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

      try {
        await transporter.sendMail(approvalMail);
      } catch (mailErr) {
        console.error("Failed to send approver notification email:", mailErr);
      }
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
