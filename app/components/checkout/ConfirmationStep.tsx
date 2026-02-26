"use client"

import { useCheckout } from "@/app/context/CheckoutContext";
import { ReviewSection } from "./ReviewSection";
import { OrderItemsReview } from "./OrderItemsReview";
import { PixQRCodeDisplay } from "./PixQRCodeDisplay";
import { ExpirationTimer } from "@/app/checkout/ExpirationTimer";

export function ConfirmationStep() {
  const { 
    deliveryData, 
    billingData, 
    sameAsDelivery, 
    paymentMethod, 
    cardData,
    shippingFee,
    pixData,
    cartItems,
    orderedAt,
  } = useCheckout();

  const formatAddress = (data: typeof deliveryData) => {
    return (
      <>
        {data.street}, {data.number} {data.complement && `- ${data.complement}`}<br />
        {data.cep} - {data.recipientName}<br />
        {data.city} - {data.state}
      </>
    );
  };

  const finalBillingData = sameAsDelivery ? deliveryData : billingData;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-black">
      <ExpirationTimer orderedAt={orderedAt} />
      
      {paymentMethod === 'PIX' && pixData ? (
        <PixQRCodeDisplay 
          qrCodeText={pixData.qrCode} 
          qrCodeBase64={pixData.qrCodeBase64} 
        />
      ) : paymentMethod === 'PIX' && !pixData ? (
        <div className="flex justify-center p-8">
            <p className="text-gray-500 animate-pulse">Gerando QR Code...</p>
        </div>
      ) : null}

      <OrderItemsReview cartItems={cartItems}/>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <ReviewSection title="Entrega:">
            {formatAddress(deliveryData)}
            <div className="mt-2 inline-flex bg-gray-200 text-xs px-2 py-1 rounded text-gray-700 font-medium w-max items-center gap-2">
              <span>Frete Padrão</span>
              <span>R$ {shippingFee.toFixed(2).replace('.', ',')}</span>
            </div>
          </ReviewSection>

          <ReviewSection title="Cobrança:">
            {formatAddress(finalBillingData)}
          </ReviewSection>
        </div>

        <div>
          <ReviewSection title="Pagamento:">
            {paymentMethod === 'PIX' ? (
              <p>Pix: 5% de desconto</p>
            ) : (
              <>
                <p>Cartão de Crédito: {cardData.installments}x sem juros</p>
                <p>Cartão terminado em {cardData.number.slice(-4) || "XXXX"}</p>
              </>
            )}
          </ReviewSection>
        </div>
      </div>
    </div>
  );
}