import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { productSchema } from "@/app/lib/validators/product";
import bcrypt from "bcrypt"
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try{
        const body = await req.json();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { password: password, ...productData } = body;

        if (!password) {
            return NextResponse.json({ message: "Password is required" }, { status: 400 });
        }
        
        const parsed = productSchema.safeParse(productData);

        if(!parsed.success){
            return NextResponse.json(
                { errors: parsed.error},
                { status: 400 }
            )
        }

        const adminId = Number(session.user.id);

        if(isNaN(adminId)){
            return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
        }

        const admin = await prisma.user.findUnique({
            where: {id: adminId}
        });

        if (!admin) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (!admin.passwordHash) {
            return NextResponse.json(
                { message: "Admin setup error: No password configured for this user." }, 
                { status: 403 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);


        if (!isPasswordValid) {
            return NextResponse.json({ message: "Wrong password" }, { status: 403 });
        }

        const { category, ...productInfo } = parsed.data;

        const categoryList = category
            .split(',')
            .map((c) => c.trim())
            .filter((c) => c.length > 0);

        const newProduct = await prisma.product.create({
            data: {
                ...productInfo, 
                created_by: adminId,
                category: {
                    connectOrCreate: categoryList.map((catName) => ({
                        where: { name: catName },
                        create: { name: catName },
                    })),
                },
            },
        });

        return NextResponse.json(newProduct, {status: 201})

    }catch( error ){
        console.log(error)
        return NextResponse.json({message: "Internal error"}, {status: 500})
    }
}