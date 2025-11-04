import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { token } = await context.params;
    const { password, cpassword } = await req.json();
    console.log("password: ", password);
    console.log("cpassword: ", cpassword);
    console.log("token: ", token);

    if (!token) {
      return NextResponse.json({ error: "Token is missing" }, { status: 400 });
    }

    const checkToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!checkToken) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      );
    }

    // ✅ Token expired?
    if (new Date() > checkToken.expiresAt) {
      await prisma.passwordResetToken.delete({
        where: { id: checkToken.id },
      });

      return NextResponse.json(
        { error: "Reset link has expired" },
        { status: 400 }
      );
    }

    // ✅ Password match?
    if (password !== cpassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // ✅ Hash new password
    const hashPassword = await hash(password, 12);

    await prisma.user.update({
      where: { id: checkToken.userId },
      data: { password: hashPassword },
    });

    // ✅ Delete used token
    await prisma.passwordResetToken.delete({
      where: { id: checkToken.id },
    });

    return NextResponse.json(
      { message: "Password updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
