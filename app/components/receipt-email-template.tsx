import * as React from 'react';

interface ReceiptEmailProps {
  name: string;
  orderId: number;
  receiptLink: string;
}

export const ReceiptEmail: React.FC<Readonly<ReceiptEmailProps>> = ({
  name,
  orderId,
  receiptLink,
}) => (
  <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', padding: '20px' }}>
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      
      <div style={{ backgroundColor: '#000000', padding: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px' }}>Ice Store</h1>
      </div>

      <div style={{ padding: '30px', color: '#333333' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Olá, {name}!</h2>
        
        <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
          O pagamento do seu pedido <strong>#{orderId}</strong> foi aprovado com sucesso! Já estamos separando os seus produtos para o envio.
        </p>

        <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
          Para ver os detalhes da compra, os itens e os valores totais, baixe o seu recibo oficial clicando no botão abaixo:
        </p>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={receiptLink}
            style={{
              backgroundColor: '#12581D',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '5px',
              textDecoration: 'none',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            Baixar Recibo (PDF)
          </a>
        </div>

        <p style={{ fontSize: '14px', color: '#666666', marginTop: '20px' }}>
          Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:
          <br />
          <a href={receiptLink} style={{ color: '#0000EE' }}>{receiptLink}</a>
        </p>
      </div>

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#888888' }}>
        <p>Se você tiver alguma dúvida sobre a entrega, responda a este e-mail.</p>
        <p>© 2026 Ice Store. Todos os direitos reservados.</p>
      </div>

    </div>
  </div>
);

export default ReceiptEmail;