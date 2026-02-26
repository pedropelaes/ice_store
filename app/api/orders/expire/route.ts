import { NextResponse } from "next/server";
import { changeOrderStatus } from "@/app/actions/payment"; 

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();

        await changeOrderStatus(false, Number(orderId));
        
        console.log(`Verificação de expiração executada para o pedido #${orderId}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro na rota de expiração:", error);
        return NextResponse.json({ error: "Erro ao processar expiração" }, { status: 500 });
    }
}