import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const createFormType = await prisma.formType.create({
      data: body,
    });

    return NextResponse.json(createFormType);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function GET() {
  try {
    const getAllFormType = await prisma.formType.findMany();
    return NextResponse.json(getAllFormType);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
