import { requireFullAdmin } from "@/src/lib/admin-access";
import { prisma } from "../../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await requireFullAdmin();
    if (denied) return denied;
    const { id } = await context.params;

    const body = await request.json();
    const { name, description } = body;
    const updatedFormType = await prisma.formType.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
      },
    });
    return new Response(JSON.stringify(updatedFormType), { status: 200 });
  } catch (error) {
    console.error("Error updating form type:", error);
    return NextResponse.json("Failed to update form type", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await requireFullAdmin();
    if (denied) return denied;
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { error: "Form type id is missing" },
        { status: 400 },
      );
    }

    await prisma.formType.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json(
      { message: "Form type deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting form type:", error);
    return NextResponse.json("Failed to delete form type", { status: 500 });
  }
}
