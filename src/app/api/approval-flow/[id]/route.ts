import { requireFullAdmin } from "@/src/lib/admin-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await requireFullAdmin();
    if (denied) return denied;
    const body = await req.json();
    const { id } = await context.params;

    const {
      formTypeId,
      order,
      role,
      fallbackRole,
      combineWithFallback,
      division,
      department,
      section,
      approver,
      approverSource,
      formFieldKey,
      approvalMode,
      stepType,
    } = body;

    // Treat "0" or "" as null
    const parseNullableNumber = (value: string) => {
      if (!value || value === "0") return null;
      return Number(value);
    };

    const updatedApprovalFlow = await prisma.approvalFlowStep.update({
      where: { id: Number(id) },
      data: {
        formTypeId: Number(formTypeId),
        order: Number(order),
        // "role" is unused when approverSource is MANUAL/FORM_FIELD, but the
        // column is required, so fall back to a harmless placeholder.
        role: role || "STAFF",
        fallbackRole: fallbackRole || null,
        combineWithFallback: Boolean(fallbackRole) && Boolean(combineWithFallback),
        divisionId: parseNullableNumber(division),
        departmentId: parseNullableNumber(department),
        sectionId: parseNullableNumber(section),
        approverSource: approverSource || "ROLE",
        formFieldKey: formFieldKey || null,
        approvalMode: approvalMode || "ALL",
        stepType: stepType === "NOTIFY" ? "NOTIFY" : "APPROVER",
      },
    });

    await prisma.approvalStepApprover.deleteMany({
      where: { stepId: Number(id) },
    });

    if (approver && approver.length > 0) {
      await prisma.approvalStepApprover.createMany({
        data: approver.map((id: string) => ({
          stepId: updatedApprovalFlow.id,
          userId: Number(id),
        })),
      });
    }

    return NextResponse.json(updatedApprovalFlow);
  } catch (error) {
    console.error("Error updating approval flow:", error);
    return new Response("Error updating approval flow", { status: 500 });
  }
}
