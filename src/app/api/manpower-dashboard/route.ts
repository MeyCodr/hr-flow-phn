import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-options";
import { prisma } from "../../../../lib/prisma";

type EmployeeRecord = {
  empNo: string;
  division: string;
  department: string;
  section: string;
  plant: string;
  gender: string;
  labourCategory: string;
  employeeType: string;
  employeeStatus: string;
  citizenship: string;
  joinDate: string;
  resignationDate: string | null;
  snapshotMonth?: number | null;
  snapshotYear?: number | null;
};

function isEmployeeRecordArray(value: unknown): value is EmployeeRecord[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.empNo === "string" &&
        typeof item.department === "string" &&
        typeof item.plant === "string" &&
        typeof item.joinDate === "string",
    )
  );
}

export async function GET() {
  try {
    const latestUpload = await prisma.manpowerUpload.findFirst({
      orderBy: { id: "desc" },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        recordCount: true,
        createdAt: true,
        employeeData: true,
        uploadedBy: {
          select: {
            fullname: true,
            staffid: true,
          },
        },
      },
    });

    if (!latestUpload) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    if (!isEmployeeRecordArray(latestUpload.employeeData)) {
      console.error(
        "Latest manpower upload has invalid employeeData shape:",
        latestUpload.id,
      );
      return NextResponse.json({ data: null }, { status: 200 });
    }

    return NextResponse.json({
      data: {
        id: latestUpload.id,
        fileName: latestUpload.fileName,
        fileType: latestUpload.fileType,
        fileSize: latestUpload.fileSize,
        recordCount: latestUpload.recordCount,
        createdAt: latestUpload.createdAt,
        uploadedBy: latestUpload.uploadedBy,
        employees: latestUpload.employeeData,
      },
    });
  } catch (error) {
    console.error("Failed to fetch manpower upload:", error);
    return NextResponse.json(
      { error: "Failed to fetch manpower upload." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.staffid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { staffid: session.user.staffid },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const rawEmployees = formData.get("employees");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (typeof rawEmployees !== "string") {
      return NextResponse.json(
        { error: "Employee data is required" },
        { status: 400 },
      );
    }

    const parsedEmployees: unknown = JSON.parse(rawEmployees);

    if (!isEmployeeRecordArray(parsedEmployees) || parsedEmployees.length === 0) {
      return NextResponse.json(
        { error: "Employee data is invalid" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const upload = await prisma.manpowerUpload.create({
      data: {
        fileName: file.name,
        fileType: file.type || "application/octet-stream",
        fileSize: file.size,
        fileContent: fileBuffer,
        employeeData: parsedEmployees,
        recordCount: parsedEmployees.length,
        uploadedById: user.id,
      },
    });

    return NextResponse.json({
      message: "Manpower workbook saved successfully.",
      data: {
        id: upload.id,
        fileName: upload.fileName,
        recordCount: upload.recordCount,
        createdAt: upload.createdAt,
        employees: parsedEmployees,
      },
    });
  } catch (error) {
    console.error("Failed to save manpower upload:", error);
    return NextResponse.json(
      { error: "Failed to save manpower upload." },
      { status: 500 },
    );
  }
}

