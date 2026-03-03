import * as React from 'react';

interface ResetPasswordEmailTemplateProps {
  name: string;
  resetLink: string;
}

export const ResetPasswordEmailTemplate: React.FC<Readonly<ResetPasswordEmailTemplateProps>> = ({
  name,
  resetLink,
}) => (
  <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', padding: '20px' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      
      <div style={{ backgroundColor: '#000000', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>Ice Store</h1>
      </div>

      <div style={{ padding: '30px', color: '#333333' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Olá, {name}!</h2>
        
        <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
          Recebemos uma solicitação para redefinir a senha da sua conta na Ice Store. Se foi você, clique no botão abaixo para criar uma nova senha:
        </p>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={resetLink}
            style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '5px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            Redefinir minha senha
          </a>
        </div>

        <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
          <strong>Atenção:</strong> Este link é válido por apenas 1 hora.
        </p>

        <p style={{ fontSize: '14px', color: '#666666', marginTop: '20px' }}>
          Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:
          <br />
          <a href={resetLink} style={{ color: '#0000EE', wordBreak: 'break-all' }}>{resetLink}</a>
        </p>
      </div>

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#888888' }}>
        <p>Se você não solicitou a redefinição de senha, por favor ignore este e-mail. Sua senha atual permanecerá segura.</p>
        <p>© 2026 Ice Store. Todos os direitos reservados.</p>
      </div>

    </div>
  </div>
);