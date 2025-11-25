import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

type FormDataType = Record<string, unknown> & {
  division?: string;
  department?: string;
  section?: string;
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;
    const formId = Number(id);

    if (!formId)
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      );

    const formDetails = await prisma.formSubmission.findUnique({
      where: { id: formId },
      include: {
        formType: { select: { name: true } },
        createdBy: { select: { fullname: true, staffid: true, email: true } },
        attachments: true,
        approvals: true,
      },
    });

    if (!formDetails) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Cast to your expected type
    const formData = formDetails.formData as FormDataType;

    const divisionId = formData?.division
      ? Number(formData.division)
      : undefined;
    const departmentId = formData?.department
      ? Number(formData.department)
      : undefined;
    const sectionId = formData?.section ? Number(formData.section) : undefined;

    const [divisionName, departmentName, sectionName] = await Promise.all([
      divisionId
        ? prisma.division.findUnique({
            where: { id: divisionId },
            select: { name: true },
          })
        : null,
      departmentId
        ? prisma.department.findUnique({
            where: { id: departmentId },
            select: { name: true },
          })
        : null,
      sectionId
        ? prisma.section.findUnique({
            where: { id: sectionId },
            select: { name: true },
          })
        : null,
    ]);

    return NextResponse.json({
      ...formDetails,
      divisionName: divisionName?.name || null,
      departmentName: departmentName?.name || null,
      sectionName: sectionName?.name || null,
    });
  } catch (error) {
    console.error("Error fetching form details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { newStatus, remarks } = body;
    const { id } = await context.params;
    const approvalId = Number(id);

    if (!approvalId || !newStatus) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // Fetch approval + submission + approvals + form type
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        submission: {
          include: {
            approvals: { orderBy: { stepOrder: "asc" } },
            formType: true,
          },
        },
      },
    });

    if (!approval) {
      return NextResponse.json(
        { error: "Approval not found" },
        { status: 404 }
      );
    }

    const submission = approval.submission;
    const submissionId = submission.id;

    // Check if grievance
    const isGrievance =
      submission.formType?.name?.trim().toLowerCase() === "grievance report";

    // Update THIS approval
    await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: newStatus,
        remarks: remarks ? "Admin: " + remarks : null,
        approvedAt: newStatus === "APPROVED" ? new Date() : null,
      },
    });

    const approvals = submission.approvals;

    // ======================================================
    // ⭐ SPECIAL LOGIC FOR GRIEVANCE (auto-approve remaining)
    // ======================================================
    if (newStatus === "APPROVED" && isGrievance) {
      const laterApprovals = approvals.filter(
        (a) => a.stepOrder > approval.stepOrder
      );

      // Approve all future approval steps ONLY
      await Promise.all(
        laterApprovals.map((a) =>
          prisma.approval.update({
            where: { id: a.id },
            data: { status: "APPROVED", approvedAt: new Date() },
          })
        )
      );

      // Finally mark submission as fully approved
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: { status: "APPROVED" },
      });

      return NextResponse.json({
        message:
          "Grievance: remaining approval steps auto-approved successfully",
      });
    }

    // ======================================================
    // NORMAL LOGIC FOR OTHER FORM TYPES
    // ======================================================

    if (newStatus === "APPROVED") {
      const nextStep = approvals.find(
        (a) => a.stepOrder === approval.stepOrder + 1
      );

      if (nextStep) {
        await prisma.approval.update({
          where: { id: nextStep.id },
          data: { status: "PENDING" },
        });

        const laterSteps = approvals.filter(
          (a) => a.stepOrder > nextStep.stepOrder
        );
        await Promise.all(
          laterSteps.map((a) =>
            prisma.approval.update({
              where: { id: a.id },
              data: { status: "WAITING" },
            })
          )
        );

        await prisma.formSubmission.update({
          where: { id: submissionId },
          data: { status: "PENDING" },
        });
      } else {
        await prisma.formSubmission.update({
          where: { id: submissionId },
          data: { status: "APPROVED" },
        });
      }
    }

    // Rejection logic
    else if (newStatus === "REJECTED") {
      const laterApprovals = approvals.filter(
        (a) => a.stepOrder >= approval.stepOrder
      );

      await Promise.all(
        laterApprovals.map((a) =>
          prisma.approval.update({
            where: { id: a.id },
            data: { status: "REJECTED" },
          })
        )
      );

      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: { status: "REJECTED" },
      });
    }

    return NextResponse.json({
      message: "Approval and form status updated successfully",
    });
  } catch (error) {
    console.error("Admin status update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
