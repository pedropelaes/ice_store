import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import PDFDocument from "pdfkit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order");

    if (!orderId) {
      return new NextResponse("ID do pedido não fornecido.", { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        client: true,
        orderItems: {
          include: { product: true }
        },
        shipping: true,
        payment: true,
      }
    });

    if (!order) {
      return new NextResponse("Pedido não encontrado.", { status: 404 });
    }

    // 3. Criação do PDF em memória
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      // Coleta os pedaços de dados conforme o PDF é gerado
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      
      // Cabeçalho
      doc.fontSize(24).font('Helvetica-Bold').text("ICE STORE", { align: "center" });
      doc.fontSize(12).font('Helvetica').text("Recibo de Compra", { align: "center" });
      doc.moveDown(2);

      // Dados do Pedido
      doc.fontSize(12).font('Helvetica-Bold').text(`Pedido #${order.id}`);
      doc.font('Helvetica').text(`Data: ${order.orderedAt.toLocaleDateString('pt-BR')}`);
      doc.text(`Status: ${order.status === 'PAID' ? 'PAGO' : order.status}`);
      doc.moveDown();

      // Dados do Cliente
      doc.font('Helvetica-Bold').text("Dados do Cliente:");
      doc.font('Helvetica').text(`Nome: ${order.client.name || "Cliente"}`);
      doc.text(`E-mail: ${order.client.email}`);
      doc.text(`CPF: ${order.client.cpf}`)
      doc.moveDown();

      // Dados do Envio
    if (order.shipping) {
        doc.font('Helvetica-Bold').text("Endereço de Entrega:");
        doc.font('Helvetica').text(`${order.shipping.recipient}`);
        doc.text(`${order.shipping.street}, ${order.shipping.number} ${order.shipping.complement || ""}`);
        doc.text(`${order.shipping.neighborhood} - ${order.shipping.city}/${order.shipping.state}`);
        doc.text(`CEP: ${order.shipping.zipCode}`);
        doc.moveDown();
    }

    if(order.payment) {
      doc.font('Helvetica-Bold').text("Dados do pagamento:");
      doc.font('Helvetica').text(`Método de pagamento: ${order.payment.method === 'CREDIT' ? "Cartão de crédito" : "Pix"}`);
      if(order.payment.method === 'CREDIT'){
        doc.font('Helvetica').text(`Cartão: XXXX-XXXX-XXXX-${order.payment.card_last4}`);
        doc.font('Helvetica').text(`Bandeira: ${order.payment.card_brand}`)
      }
      doc.moveDown();
    }
        

      // Linha divisória
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Itens do Pedido
      doc.font('Helvetica-Bold').text("Itens do Pedido:");
      doc.moveDown(0.5);
      
      order.orderItems.forEach((item) => {
        doc.font('Helvetica').text(
          `${item.quantity}x ${item.product.name} (Tam: ${item.size}) - R$ ${(Number(item.unit_price) * item.quantity).toFixed(2).replace('.', ',')}`
        );
      });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Totais
      doc.font('Helvetica-Bold').text(`Total Bruto: R$ ${Number(order.total_gross).toFixed(2).replace('.', ',')}`, { align: "right" });
      doc.text(`Total Pago: R$ ${Number(order.total_final).toFixed(2).replace('.', ',')}`, { align: "right" });

      doc.end();
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recibo-icestore-${order.id}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Erro ao gerar recibo:", error);
    return new NextResponse("Erro interno ao gerar o recibo.", { status: 500 });
  }
}