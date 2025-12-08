import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { generateResetToken, getFirstName } from "../../../../../lib/utils";
import { transporter } from "../../../../../lib/emailService";

const emailFrom = process.env.EMAIL;
const webLink = process.env.NEXTAUTH_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is missing" }, { status: 400 });
    }

    // Check if user exists
    const finduser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!finduser) {
      return NextResponse.json(
        { error: "Email does not exist" },
        { status: 400 }
      );
    }

    const token = generateResetToken();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordResetToken.create({
      data: {
        token: token,
        userId: finduser.id,
        expiresAt: expiresAt,
      },
    });

    const mailOptions = {
      from: emailFrom,
      to: finduser.email,
      subject: "Password Reset Request",
      template: "resetPassword",
      context: {
        username: getFirstName(finduser.fullname),
        resetLink: `${webLink}/reset-password?token=${token}`,
      },
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "Reset password link has been successfully sent.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error || "Internal Server Error" },
      { status: 500 }
    );
  }
}
