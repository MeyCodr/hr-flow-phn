import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await context.params;

    const approvals = await prisma.approval.findMany({
      where: { submissionId: Number(id) },
      include: {
        approver: {
          select: {
            id: true,
            fullname: true,
            staffid: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ approvals });
  } catch (error) {
    console.error("Error fetching approval details:", error);
    return NextResponse.json(
      { error: "Failed to fetch approval details" },
      { status: 500 }
    );
  }
}
