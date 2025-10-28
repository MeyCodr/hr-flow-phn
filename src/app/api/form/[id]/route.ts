import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

type FormDataType = Record<string, unknown> & {
  division?: string;
  department?: string;
  section?: string;
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const formId = Number(id);

    if (!formId)
      return NextResponse.json(
        { error: "Form ID is required" },
        { status: 400 }
      );

    const formDetails = await prisma.formSubmission.findUnique({
      where: { id: formId },
      include: {
        formType: { select: { name: true } },
        createdBy: { select: { fullname: true, staffid: true, email: true } },
        attachments: true,
        approvals: true,
      },
    });

    if (!formDetails) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Cast to your expected type
    const formData = formDetails.formData as FormDataType;

    const divisionId = formData?.division
      ? Number(formData.division)
      : undefined;
    const departmentId = formData?.department
      ? Number(formData.department)
      : undefined;
    const sectionId = formData?.section ? Number(formData.section) : undefined;

    const [divisionName, departmentName, sectionName] = await Promise.all([
      divisionId
        ? prisma.division.findUnique({
            where: { id: divisionId },
            select: { name: true },
          })
        : null,
      departmentId
        ? prisma.department.findUnique({
            where: { id: departmentId },
            select: { name: true },
          })
        : null,
      sectionId
        ? prisma.section.findUnique({
            where: { id: sectionId },
            select: { name: true },
          })
        : null,
    ]);

    return NextResponse.json({
      ...formDetails,
      divisionName: divisionName?.name || null,
      departmentName: departmentName?.name || null,
      sectionName: sectionName?.name || null,
    });
  } catch (error) {
    console.error("Error fetching form details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
