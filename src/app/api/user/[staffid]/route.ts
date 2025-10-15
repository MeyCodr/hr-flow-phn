import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { hash } from "bcrypt";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ staffid: string }> }
) {
  try {
    const { staffid } = await context.params;

    console.log("staff id: ", staffid);

    if (!staffid) {
      return NextResponse.json(
        { error: "Staff id is missing" },
        { status: 400 }
      );
    }

    const findUser = await prisma.user.findUnique({
      where: { staffid },
    });

    if (!findUser) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Retrieve current user", data: findUser },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ staffid: string }> }
) {
  try {
    const { staffid } = await context.params;
    const {
      password,
      staffId,
      email,
      fullname,
      designation,
      division,
      department,
      section,
    } = await req.json();

    if (!staffid) {
      return NextResponse.json(
        { error: "Staff id is missing" },
        { status: 400 }
      );
    }

    const hashedPassword = password ? await hash(password, 12) : undefined;

    const updateUser = await prisma.user.update({
      where: { staffid },
      data: {
        staffid: staffId,
        email,
        fullname,
        designation,
        divisionId: Number(division),
        departmentId: Number(department),
        sectionId: Number(section),
        ...(hashedPassword && { password: hashedPassword }),
      },
    });

    return NextResponse.json(
      { message: "Successfully updated", data: updateUser },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
