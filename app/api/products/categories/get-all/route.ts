import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try{
        const { searchParams } = new URL(req.url);
        const limitParam = searchParams.get("limit");

        const take = limitParam ? parseInt(limitParam) : undefined;

        const categories = await prisma.category.findMany({
            take: take,
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