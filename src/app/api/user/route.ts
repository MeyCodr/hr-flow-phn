import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { hash } from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("body: ", body);

    // Convert 0 values to null for database fields that should be optional
    const processedBody = {
      ...body,
      division:
        body.division === 0 || body.division === "0" ? null : body.division,
      department:
        body.department === 0 || body.department === "0"
          ? null
          : body.department,
      section: body.section === 0 || body.section === "0" ? null : body.section,
    };

    console.log("process body : ", processedBody);

    const { password, staffid, email, division, department, section, ...rest } =
      processedBody;

    // Type assertions to ensure string types
    const staffIdString = String(staffid);
    const emailString = String(email);
    const passwordString = String(password);

    const checkStaffId = await prisma.user.findUnique({
      where: {
        staffid: staffIdString,
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
        email: emailString,
      },
    });

    if (checkEmail) {
      return NextResponse.json(
        { error: "Email already exist" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(passwordString, 12);

    // Handle number conversions - use null for empty values
    const divisionId = division ? Number(division) : null;
    const departmentId = department ? Number(department) : null;
    const sectionId = section ? Number(section) : null;

    const createUser = await prisma.user.create({
      data: {
        password: hashedPassword,
        staffid: staffIdString,
        email: emailString,
        divisionId: divisionId,
        departmentId: departmentId,
        sectionId: sectionId,
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
