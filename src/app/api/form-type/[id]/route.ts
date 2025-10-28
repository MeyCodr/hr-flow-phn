import { prisma } from "../../../../../lib/prisma";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
    return new Response("Failed to update form type", { status: 500 });
  }
}
