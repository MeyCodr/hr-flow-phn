import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-options";
import { prisma } from "../../../../../lib/prisma";
import { Prisma } from "@/generated/client";


type ApprovalWithSubmission = Prisma.ApprovalGetPayload<{
  include: {
    submission: {
      include: {
        createdBy: true;
        formType: { select: { name: true } };
        approvals: {
          orderBy: { stepOrder: "asc" };
          include: { approver: true };
        };
      };
    };
  };
}>;

type SubmissionApproval = NonNullable<
  ApprovalWithSubmission["submission"]
>["approvals"][number];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const staffid = session?.user?.staffid;

    if (!staffid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { staffid: staffid.toString() },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const approvals = await prisma.approval.findMany({
      where: { approverId: currentUser.id },
      include: {
        submission: {
          include: {
            createdBy: true,
            formType: { select: { name: true } },
            approvals: {
              orderBy: { stepOrder: "asc" },
              include: { approver: true },
            },
          },
        },
      },
      orderBy: { stepOrder: "asc" },
    });

    const approvalsWithLevels = approvals.map(
      (approval: ApprovalWithSubmission) => {
        const allSteps = approval.submission.approvals;

        const uniqueStepOrders = [
          ...new Set(allSteps.map((s: SubmissionApproval) => s.stepOrder)),
        ].sort((a, b) => a - b);

        const stepOrderToLevel = new Map(
          uniqueStepOrders.map((stepOrder, index) => [stepOrder, index + 1]),
        );

        const totalLevel = uniqueStepOrders.length;

        const activeApproval = allSteps.find(
          (a: SubmissionApproval) => a.status === "PENDING"
        );

        const activeLevel = activeApproval
          ? (stepOrderToLevel.get(activeApproval.stepOrder) ?? totalLevel)
          : totalLevel;

        return {
          ...approval,
          totalLevel,
          currentLevel: stepOrderToLevel.get(approval.stepOrder) ?? totalLevel,
          activeLevel,
        };
      }
    );

    // 2️⃣ Fetch this user's own submitted forms
    const selfForms = await prisma.formSubmission.findMany({
      where: {
        createdById: currentUser.id,
      },
      include: {
        formType: { select: { name: true } },
        approvals: { orderBy: { stepOrder: "asc" } },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      pendingApprovals: approvalsWithLevels,
      selfForms,
    });
  } catch (error) {
    console.error("Error refreshing approval form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

