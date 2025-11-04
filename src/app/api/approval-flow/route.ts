import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();

    const { formTypeId, order, role, division, department, section } = body;

    // Treat "0" or "" as null
    const parseNullableNumber = (value: string) => {
      if (!value || value === "0") return null;
      return Number(value);
    };

    const newApprovalFlow = await prisma.approvalFlowStep.create({
      data: {
        formTypeId: Number(formTypeId),
        order: Number(order),
        role,
        divisionId: parseNullableNumber(division),
        departmentId: parseNullableNumber(department),
        sectionId: parseNullableNumber(section),
      },
    });

    return NextResponse.json(newApprovalFlow);
  } catch (error) {
    console.error("Error creating approval flow:", error);
    return new Response("Error creating approval flow", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const approvalFlows = await prisma.approvalFlowStep.findMany({
      include: {
        formType: true,
        division: true,
        department: true,
        section: true,
      },
    });
    return NextResponse.json(approvalFlows);
  } catch (error) {
    console.error("Error fetching approval flows:", error);
    return new Response("Error fetching approval flows", { status: 500 });
  }
}
