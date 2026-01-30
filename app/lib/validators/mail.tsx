import { Resend } from 'resend';
import { EmailTemplate } from '@/app/components/email-template';
const resend = new Resend(process.env.RESEND_API_KEY);

// Pega a URL do site (Localhost ou Produção)
const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const confirmLink = `${domain}/auth/new-verification?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Sua Loja <onboarding@resend.dev>', 
      to: email,
      subject: 'Confirme seu e-mail - Sua Loja',
      react: <EmailTemplate name={name} confirmLink={confirmLink} />, 
    });

    if (error) {
        console.error("Erro ao enviar email:", error);
        return false;
    }

    return true;
  } catch (err) {
    console.error("Erro no Resend:", err);
    return false;
  }
};