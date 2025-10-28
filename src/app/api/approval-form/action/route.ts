import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { approvalId, action, remarks } = await req.json();
    console.log("approvalId: ", approvalId);
    console.log("action: ", action);

    if (!approvalId || !action)
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );

    // 1️⃣ Find the approval record
    const approval = await prisma.approval.findUnique({
      where: { id: Number(approvalId) },
      include: {
        submission: {
          include: { approvals: true },
        },
      },
    });

    console.log("approval: ", approval);
    

    if (!approval)
      return NextResponse.json(
        { error: "Approval not found" },
        { status: 404 }
      );

    const submissionId = approval.submissionId;
    console.log("submissionId: ", submissionId);


    // 2️⃣ Update current approval
    await prisma.approval.update({
      where: { id: approval.id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        remarks: remarks || null,
        approvedAt: new Date(),
      },
    });

    console.log("1");


    // 3️⃣ Handle next steps
    if (action === "approve") {
      // find next step
      const nextStep = approval.submission.approvals.find(
        (a) => a.stepOrder === approval.stepOrder + 1
      );

      if (nextStep) {
        // set next step to PENDING
        await prisma.approval.updateMany({
          where: {
            submissionId,
            stepOrder: approval.stepOrder + 1,
          },
          data: { status: "PENDING" },
        });
      } else {
        // no more steps → mark form as fully approved
        await prisma.formSubmission.update({
          where: { id: submissionId },
          data: { status: "APPROVED" },
        });
      }
    } else {
      // ❌ Rejected → mark form as REJECTED immediately
      await prisma.formSubmission.update({
        where: { id: submissionId },
        data: { status: "REJECTED" },
      });
    console.log("2");

      // Also update all remaining approvals to REJECTED
      await prisma.approval.updateMany({
        where: {
          submissionId,
          stepOrder: { gt: approval.stepOrder },
        },
        data: { status: "REJECTED" },
      });
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
