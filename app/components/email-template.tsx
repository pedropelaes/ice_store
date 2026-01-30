import * as React from 'react';

interface EmailTemplateProps {
  name: string;
  confirmLink: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  confirmLink,
}) => (
  <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', padding: '20px' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      
      <div style={{ backgroundColor: '#000000', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>Ice Store</h1>
      </div>

      <div style={{ padding: '30px', color: '#333333' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Olá, {name}!</h2>
        
        <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
          Obrigado por se cadastrar. Para acessar todas as funcionalidades da nossa loja e garantir a segurança da sua conta, por favor confirme seu endereço de e-mail.
        </p>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={confirmLink}
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
            Confirmar meu E-mail
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#666666', marginTop: '20px' }}>
          Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:
          <br />
          <a href={confirmLink} style={{ color: '#0000EE' }}>{confirmLink}</a>
        </p>
      </div>

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#888888' }}>
        <p>Se você não criou esta conta, pode ignorar este e-mail.</p>
        <p>© 2026 Ice Store. Todos os direitos reservados.</p>
      </div>

    </div>
  </div>
);