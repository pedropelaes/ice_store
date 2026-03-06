import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { changeOrderStatus } from "@/app/actions/payment"; 

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: Request) {
    try {

        const signature = req.headers.get("Upstash-Signature");

        if (!signature) {
        console.warn("Tentativa de acesso não autorizada na rota de expiração.");
        return NextResponse.json({ error: "Acesso Negado. Assinatura ausente." }, { status: 401 });
        }

        const textBody = await req.text();

        const isValid = await receiver.verify({
            signature: signature,
            body: textBody,
        });

        if (!isValid) {
            console.warn("Tentativa de acesso com assinatura inválida.");
            return NextResponse.json({ error: "Assinatura Inválida." }, { status: 401 });
        }

        const body = JSON.parse(textBody);
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: "ID do pedido não fornecido" }, { status: 400 });
        }

        await changeOrderStatus(false, Number(orderId));
        
        console.log(`Verificação de expiração executada para o pedido #${orderId}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erro na rota de expiração:", error);
        return NextResponse.json({ error: "Erro ao processar expiração" }, { status: 500 });
    }
}