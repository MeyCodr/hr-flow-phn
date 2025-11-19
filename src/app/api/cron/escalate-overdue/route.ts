import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { transporter } from "../../../../../lib/emailService";

const emailFrom = process.env.EMAIL;
const webLink = process.env.NEXTAUTH_URL;

export async function GET() {
  try {
    const now = new Date();

    // 1️⃣ Find overdue approvals (not escalated yet)
    const overdueApprovals = await prisma.approval.findMany({
      where: {
        status: "PENDING",
        deadline: { lte: now },
        escalated: false,
      },
      include: {
        approver: true,
        submission: {
          include: {
            createdBy: {
              include: { department: true, division: true, section: true },
            },
            formType: true,
          },
        },
      },
    });

    if (overdueApprovals.length === 0) {
      return NextResponse.json({ message: "No overdue approvals found" });
    }

    for (const approval of overdueApprovals) {
      // 2️⃣ Determine maximum step (CEO is always last)
      const maxStep = await prisma.approval.aggregate({
        where: { submissionId: approval.submissionId },
        _max: { stepOrder: true },
      });

      const isFinalStep = approval.stepOrder === maxStep._max.stepOrder;

      // 3️⃣ FINAL STEP? (CEO) → DO NOT ESCALATE ❌
      if (isFinalStep) {
        console.log(
          `Skipping escalation for FINAL STEP (CEO) on approval ID ${approval.id}`
        );
        continue; // ⛔ Skip to next approval
      }

      // 4️⃣ Get next approver step
      const nextStep = await prisma.approval.findFirst({
        where: {
          submissionId: approval.submissionId,
          stepOrder: approval.stepOrder + 1,
        },
        include: { approver: true },
      });

      // 5️⃣ Set new deadline (different for last step)
      const intervalMinutes =
        nextStep?.stepOrder === maxStep._max.stepOrder ? 7 : 5;
      const newDeadline = new Date(Date.now() + intervalMinutes * 60 * 1000);

      // 6️⃣ Email recipient logic
      let recipientEmail = nextStep
        ? nextStep.approver.email
        : approval.approver.email;

      let ccEmails: string[] = [];

      // Step 1 → CC Step 2
      const nextApprover = await prisma.approval.findFirst({
        where: {
          submissionId: approval.submissionId,
          stepOrder: approval.stepOrder + 1,
        },
        include: { approver: true },
      });

      if (approval.stepOrder === 1 && nextApprover) {
        ccEmails.push("adila@phn.com.my"); // human capital PIC
      }

      // 7️⃣ Send escalation email
      const mailOptions = {
        from: emailFrom,
        to: recipientEmail,
        cc: ccEmails,
        subject: `Escalation: ${approval.submission.formType.name} pending > 5 days`,
        template: "overdueAction",
        context: {
          hcdName: nextStep?.approver.fullname,
          formTitle: approval.submission.formType.name,
          requestorName: approval.submission.createdBy.fullname,
          requestorStaffId: approval.submission.createdBy.staffid,
          previousApproverName: approval.approver.fullname,
          department: approval.submission.createdBy.department?.name || "-",
          submittedAt: new Date(approval.submission.createdAt).toLocaleString(),
          approvalLink: `${webLink}/dashboard/approval?id=${approval.submission.id}&name=${approval.submission.formType.name}`,
        },
      };

      await transporter.sendMail(mailOptions);

      // 8️⃣ Mark overdue approval as escalated
      await prisma.approval.update({
        where: { id: approval.id },
        data: { escalated: true, status: "ESCALATED" },
      });

      // 9️⃣ Activate next step
      if (nextStep && nextStep.status === "WAITING") {
        await prisma.approval.update({
          where: { id: nextStep.id },
          data: { status: "PENDING", deadline: newDeadline },
        });
      }
    }

    return NextResponse.json({
      message: `Escalated ${overdueApprovals.length} approval(s) to next level.`,
    });
  } catch (error) {
    console.error("Escalation error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
