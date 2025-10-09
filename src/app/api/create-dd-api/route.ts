import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Create Divisions first
  // const createDivision = await prisma.division.createMany({
  //   data: body,
  //   skipDuplicates: true, // avoids error if division already exists
  // });

  // Create Departments
  // const createDepartment = await prisma.department.createMany({
  //   data: body,
  //   skipDuplicates: true,
  // });

  const createSection = await prisma.section.createMany({
    data: body
  })

  return NextResponse.json({
    message: "Success",
    // divisions: createDivision,
    // departments: createDepartment,
    sections: createSection,
  });
}
