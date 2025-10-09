import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const divisionId = searchParams.get("divisionId");

        const getDepartment = await prisma.department.findMany({
            where: {
                divisionId: Number(divisionId),
            }
        });
        return NextResponse.json(getDepartment, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}