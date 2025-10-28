import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "../../../../../lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
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
            createdBy: { select: { fullname: true } },
            formType: { select: { name: true } },
            approvals: { orderBy: { stepOrder: "asc" } },
          },
        },
      },
      orderBy: { stepOrder: "asc" },
    });

    // Calculate levels
    const approvalsWithLevels = approvals.map((approval) => {
      const allSteps = approval.submission.approvals;
      const totalLevel = allSteps.length;
      const activeApproval = allSteps.find((a) => a.status === "PENDING");
      const activeLevel = activeApproval
        ? activeApproval.stepOrder
        : totalLevel;

      return {
        ...approval,
        totalLevel,
        currentLevel: approval.stepOrder,
        activeLevel,
      };
    });

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
