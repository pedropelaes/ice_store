import { Resend } from 'resend';
import { EmailTemplate } from '@/app/components/email-template';
import { ReceiptEmail } from '@/app/components/receipt-email-template'; // Ajuste o caminho conforme onde salvou

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;
  
  const destinatario = process.env.NODE_ENV === 'development' 
    ? 'pedropelaesdev@gmail.com' 
    : email;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Ice Store <onboarding@resend.dev>', // Lembre de mudar quando tiver um domínio próprio no Resend
      to: destinatario,
      subject: 'Confirme seu e-mail - Ice Store',
      react: <EmailTemplate name={name} confirmLink={confirmLink} />,
    });

    if (error) {
      console.error("Erro ao enviar email de verificação:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Erro no Resend (Verificação):", err);
    return false;
  }
};

export const sendReceiptEmail = async (email: string, name: string, orderId: number) => {
  const receiptLink = `${domain}/api/receipt?order=${orderId}`;
  
  const destinatario = process.env.NODE_ENV === 'development' 
    ? 'pedropelaesdev@gmail.com' 
    : email;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Ice Store <onboarding@resend.dev>',
      to: destinatario,
      subject: `Pagamento Aprovado! Pedido #${orderId} - Ice Store`,
      react: <ReceiptEmail name={name} orderId={orderId} receiptLink={receiptLink} />,
    });

    if (error) {
      console.error("Erro ao enviar email de recibo:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Erro no Resend (Recibo):", err);
    return false;
  }
};