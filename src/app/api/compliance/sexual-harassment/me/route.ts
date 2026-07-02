import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth-options";
import { isComplianceOfficer } from "@/lib/compliance-officers";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ isComplianceOfficer: false }, { status: 200 });
  }

  const officer = await isComplianceOfficer(session.user.staffid);
  return NextResponse.json({ isComplianceOfficer: officer }, { status: 200 });
}
