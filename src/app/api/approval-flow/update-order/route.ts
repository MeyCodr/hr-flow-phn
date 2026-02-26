import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const { steps } = await req.json();
    console.log("steps: ", steps);

    for (const step of steps) {
      await prisma.approvalFlowStep.updateMany({
        where: {
          id: step.id,
        },
        data: {
          order: step.order,
        },
      });
    }

    return NextResponse.json(
      { message: "Successfully Updated" },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
