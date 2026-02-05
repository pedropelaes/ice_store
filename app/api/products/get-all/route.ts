import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const products = await prisma.product.findMany({
            orderBy: {
                created_at: "desc"
            },
        });

        return NextResponse.json(products, {status: 200});
    }catch(err){
        console.log(err);
        return NextResponse.json({message: "Error while getting products", status: 500});
    }
}