import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hash } from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("body: ", body);

    const { password, staffid, email, ...rest } = body;

    const checkStaffId = await prisma.user.findUnique({
      where: {
        staffid: staffid,
      },
    });

    if (checkStaffId) {
      return NextResponse.json(
        { error: "Staff id already exist" },
        { status: 400 }
      );
    }

    const checkEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (checkEmail) {
      return NextResponse.json(
        { error: "Email already exist" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const createUser = await prisma.user.create({
      data: {
        password: hashedPassword,
        staffid: staffid,
        email: email,
        ...rest,
      },
    });

    return NextResponse.json(
      { message: "New user added successfully", user: createUser },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
