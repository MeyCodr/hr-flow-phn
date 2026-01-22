import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { hash } from "bcrypt";
import { getToken } from "next-auth/jwt";
import { User } from "@/generated/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ staffid: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { staffid } = await context.params;

    if (!staffid) {
      return NextResponse.json(
        { error: "Staff id is missing" },
        { status: 400 },
      );
    }

    const findUser = await prisma.user.findUnique({
      where: { staffid },
    });

    if (!findUser) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Retrieve current user", data: findUser },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ staffid: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { staffid } = await context.params;
    const body = await req.json();

    console.log("body: ", body);

    const {
      fullname,
      staffid: newStaffId,
      email,
      designation,
      workLocation,
      division,
      department,
      section,
      role,
      password,
    } = body;

    console.log("divisionId", division);
    console.log("departmentId", department);
    console.log("sectionId", section);

    const token = await getToken({ req });
    if (!token?.staffid)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({
      where: { staffid: token.staffid },
      select: { role: true },
    });

    if (!currentUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const isAdmin = currentUser.role === "ADMIN";

    // 🛡️ Regular user can only update their own profile
    if (!isAdmin && token.staffid !== staffid) {
      return NextResponse.json(
        { error: "Forbidden: cannot update other users" },
        { status: 403 },
      );
    }

    // 🧱 Prepare update data
    const updateData: Partial<User> = {
      fullname,
      staffid: newStaffId,
      email,
      designation,
      workLocation,
    };

    if (division) {
      const divId = Number(division);
      updateData.divisionId = divId > 0 ? divId : null;
      console.log("divId", updateData.divisionId);
    }

    if (department) {
      const depId = Number(department);
      updateData.departmentId = depId > 0 ? depId : null;
      console.log("deptId", updateData.departmentId);
    }

    if (section) {
      const secId = Number(section);
      updateData.sectionId = secId > 0 ? secId : null;
      console.log("secId", updateData.sectionId);
    }

    // 🧂 Only admin can update role
    if (isAdmin && role) {
      updateData.role = role;
    }

    // 🧂 Update password if provided
    if (password && !password.startsWith("$2b$")) {
      // hash only if not already hashed
      updateData.password = await hash(password, 12);
    }

    console.log("Update Data:", updateData);

    // 🛠️ Perform update
    const updatedUser = await prisma.user.update({
      where: { staffid },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Successfully updated", data: updatedUser },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ staffid: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { staffid } = await context.params;

    // Read the form data (for file uploads)
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save file to /public/uploads/profile/
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profile");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${staffid}_${Date.now()}_${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // Save relative path in DB
    const dbPath = `/uploads/profile/${fileName}`;

    await prisma.user.update({
      where: { staffid }, // ✅ staffid is a string now
      data: { attachment: dbPath },
    });

    return NextResponse.json({
      message: "Profile image uploaded successfully",
      path: dbPath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
