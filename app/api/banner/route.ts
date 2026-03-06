import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { image_url, route } = await req.json();

        if (!image_url || !route) {
            return NextResponse.json({ error: "Faltam dados obrigatórios." }, { status: 400 });
        }

        const createBanner = await prisma.promoBanner.create({
            data: {
                image_url: image_url,
                route: route
            }
        });

        return NextResponse.json({ success: true, banner: createBanner });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}