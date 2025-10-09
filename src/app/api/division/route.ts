import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";


export async function GET(req: NextRequest) {
    try {
        const getDivision = await prisma.division.findMany();
        return NextResponse.json(getDivision, { status: 200 });
    }
    catch (error) {
        return NextResponse.json({ error: error }, { status: 500 });
    }
}