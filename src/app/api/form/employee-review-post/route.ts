import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-options";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  //check user session
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    console.log("data: ", data);
    const { formTypeId, user, ...rest } = data;

    //validate user
    if (!user) {
      return NextResponse.json(
        { error: "User session is missing" },
        { status: 400 }
      );
    }

    //find session user staff id
    const currentUser = await prisma.user.findUnique({
      where: { staffid: user.staffid.toString() },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );
    }

    const createEmployeeReview = await prisma.formSubmission.create({
      data: {
        createdById: currentUser.id,
        formData: rest,
        status: "PENDING",
        formTypeId: Number(formTypeId),
      },
    });

    //fetch approval flow steps for this form
    const approvalFlowSteps = await prisma.approvalFlowStep.findMany({
      where: {
        formTypeId: Number(formTypeId),
      },
      orderBy: { order: "asc" },
    });

    if (approvalFlowSteps.length === 0) {
      return NextResponse.json(
        { error: "No approval flow steps defined for this form" },
        { status: 400 }
      );
    }

    return NextResponse.json(createEmployeeReview);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

