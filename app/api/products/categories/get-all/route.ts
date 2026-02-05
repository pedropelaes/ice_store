import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const categories = await prisma.category.findMany({
            orderBy: {
                products: {
                    _count: 'desc'
                }
            },
            select: { id: true, name: true }
        });

        return NextResponse.json(categories, {status: 200});
    }catch(err){
        console.log(err);
        return NextResponse.json({message: "Error while getting categories", status: 500});
    }
}