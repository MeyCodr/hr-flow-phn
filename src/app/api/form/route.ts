import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, category, formId, ...rest } = body;

    if (!user) {
      return NextResponse.json(
        { error: "User session is missing" },
        { status: 400 }
      );
    }

    const staffid = user.staffid;

    if (!staffid) {
      return NextResponse.json(
        { error: "Staff id is missing" },
        { status: 400 }
      );
    }

    const findUser = await prisma.user.findUnique({
      where: {
        staffid: staffid.toString(),
      },
    });

    if (!findUser) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 400 }
      );
    }

    const createFormRecord = await prisma.formSubmission.create({
      data: {
        formTypeId: formId,
        createdById: findUser.id,
        status: "PENDING",
        formData: rest,
      },
    });

    if (!createFormRecord) {
      return NextResponse.json(
        { error: "Unable to create form record" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Record has been created", data: createFormRecord },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
