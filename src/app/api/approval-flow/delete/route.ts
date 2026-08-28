import { requireFullAdmin } from "@/src/lib/admin-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const denied = await requireFullAdmin();
    if (denied) return denied;
    const { ids } = await req.json();

    await prisma.approvalFlowStep.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });


    return NextResponse.json({
      message: "Approval flow steps deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting approval flows:", error);
    return new Response("Error deleting approval flows", { status: 500 });
  }
}

