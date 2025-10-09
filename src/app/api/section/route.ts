import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const departmentId = searchParams.get("departmentId");

        const getSection = await prisma.section.findMany({
            where: {
                departmentId: Number(departmentId),
            }
        });
        return NextResponse.json(getSection, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}