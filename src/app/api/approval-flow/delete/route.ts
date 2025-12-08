import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
