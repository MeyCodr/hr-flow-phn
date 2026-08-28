import { requireFullAdmin } from "@/src/lib/admin-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const denied = await requireFullAdmin();
    if (denied) return denied;
    const body = await req.json();

    const createFormType = await prisma.formType.create({
      data: body,
    });

    return NextResponse.json(createFormType);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const denied = await requireFullAdmin();
    if (denied) return denied;
    const getAllFormType = await prisma.formType.findMany();
    return NextResponse.json(getAllFormType);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

