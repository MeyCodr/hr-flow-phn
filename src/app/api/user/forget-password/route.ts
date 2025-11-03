import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { compareSync, hash } from "bcrypt";

export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const {email} = body;

        if(!email){
            return NextResponse.json({error: "Email is missing"}, {status: 400});
        }

        const finduser = await prisma.user.findUnique({
            where: {
                email: email,
            }
        });

        if(!finduser){
            return NextResponse.json({error: "Email does not exist"}, {status: 400});
        }

        // const comparePassword = await
    }

    catch(error){
        return NextResponse.json({error: error}, {status: 500});
    }
}