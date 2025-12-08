import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

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
    const { id } = await context.params;

    const { formTypeId, order, role, division, department, section, approver } =
      body;

    console.log("approver: ", approver);

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
        role,
        divisionId: parseNullableNumber(division),
        departmentId: parseNullableNumber(department),
        sectionId: parseNullableNumber(section),
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
