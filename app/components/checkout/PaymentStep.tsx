"use client"

import { CardData, useCheckout } from "@/app/context/CheckoutContext";
import { CreditCard, QrCode } from "lucide-react";
import { AddressForm } from "./AdressForm";
import { formatNumbersOnly, isValidCreditCardNumber, isValidExpiryDate } from "@/app/lib/formaters/formaters";
import { PixIcon } from "../PixIcon";
import { useEffect, useState } from "react";
import { getUserPaymentMethods } from "@/app/actions/payment";

export function PaymentStep() {
  const { 
    paymentMethod, setPaymentMethod, 
    sameAsDelivery, setSameAsDelivery,
    billingData, setBillingData,
    cardData, setCardData,
    saveBillingAddress, setSaveBillingAddress,
    savePaymentMethod, setSavePaymentMethod,
    savedCardId, setSavedCardId,
    total
  } = useCheckout();

  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);

  const [installmentsOptions, setInstallmentsOptions] = useState<any[]>([]);
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(false);
  
  useEffect(() => {
    async function fetchCards() {
      const cards = await getUserPaymentMethods();
      if(Array.isArray(cards)){
        setSavedCards(cards);
      }
      setIsLoadingCards(false);
    }
    fetchCards();
  }, []);

  const handleBillingChange = (field: keyof typeof billingData, value: string) => {
    setBillingData(prev => ({ ...prev, [field]: value }));
  };

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = formatNumbersOnly(e.target.value);

    if (val.length >= 6 && installmentsOptions.length === 0) {
      const bin = val.substring(0, 6); 
      fetchInstallments(bin);
    } 
    else if (val.length < 6 && installmentsOptions.length > 0) {
      setInstallmentsOptions([]);
      handleCardChange('installments', "1"); 
    }
    
    val = val.replace(/(\d{4})(?=\d)/g, "$1 "); 
    e.target.value = val;
  };

  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = formatNumbersOnly(e.target.value);
    if (val.length > 2) val = val.replace(/^(\d{2})(\d)/, "$1/$2");
    e.target.value = val;
  };

  const handleCardChange = (field: keyof CardData, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  }

  const fetchInstallments = async (bin: string) => {
    if (typeof (window as any).MercadoPago === 'undefined') return;
    
    setIsLoadingInstallments(true);
    try {
      const mp = new (window as any).MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
      
      const response = await mp.getInstallments({
        amount: total.toString(),
        bin: bin,
      });

      if (response && response.length > 0 && response[0].payer_costs) {
        console.log("teste")
        setInstallmentsOptions(response[0].payer_costs);
      }
    } catch (error) {
      console.error("Erro ao buscar parcelas:", error);
    } finally {
      setIsLoadingInstallments(false);
    }
  };

  const isCardNumberError = cardData.number.length > 0 && !isValidCreditCardNumber(cardData.number);
  const isCardNameError = cardData.name.length > 0 && cardData.name.trim().length < 3;
  const isExpiryError = cardData.expiry.length === 5 && !isValidExpiryDate(cardData.expiry);
  const isCvvError = cardData.cvv.length > 0 && cardData.cvv.length < 3;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-6 text-black">Selecione o método de pagamento:</h2>

      <div className="flex  gap-4 mb-8">
        <button
          onClick={() => setPaymentMethod('CREDIT_CARD')}
          className={`flex-1 flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 transition-all
            ${paymentMethod === 'CREDIT_CARD' 
              ? 'border-black bg-[#333333] text-white shadow-md' 
              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }
          `}
        >
          <CreditCard size={64} />
          <span className="font-bold">Cartão de Crédito</span>
        </button>

        <button
          onClick={() => setPaymentMethod('PIX')}
          className={`flex-1 flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 transition-all
            ${paymentMethod === 'PIX' 
              ? 'border-[#00B488] bg-[#333333] text-[#82FF95] shadow-md'
              : 'border-gray-200 bg-white text-[#008A68] hover:border-gray-300'
            }
          `}
        >
          <PixIcon size={64}/>
          <span className="font-bold">PIX</span>
          {paymentMethod === 'PIX' && <span className="text-xs font-bold bg-[#00B488] text-white px-2 py-0.5 rounded-full mt-1">5% OFF</span>}
        </button>
      </div>

      {paymentMethod === 'PIX' ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-black mb-8">
          <QrCode size={48} className="mx-auto mb-4 text-[#00B488]" />
          <h3 className="font-bold text-lg mb-2">O pagamento via PIX é rápido e seguro!</h3>
          <p className="text-sm text-gray-600">
            O QR Code e o código "Copia e Cola" serão gerados na próxima tela assim que você clicar em "Finalizar".
          </p>
        </div>
      ) : (
        <div className="mb-8 text-black">
            {!isLoadingCards && savedCards.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Seus Cartões</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCards.map((card) => (
                  <div 
                    key={card.id}
                    onClick={() => setSavedCardId(card.id)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center gap-3
                      ${savedCardId === card.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'}
                    `}
                  >
                    <div className="bg-gray-200 p-2 rounded-md">
                      <CreditCard size={20} className="text-gray-700" />
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase">{card.brand} terminado em {card.last4}</p>
                      <p className="text-xs text-gray-500">Cartão salvo</p>
                    </div>
                  </div>
                ))}
              </div>

              {savedCardId && (
                <button 
                  onClick={() => setSavedCardId(null)}
                  className="text-sm text-blue-600 hover:underline mt-4 font-medium"
                >
                  + Usar um novo cartão
                </button>
              )}
            </div>
          )}

          {!savedCardId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Número do Cartão *</label>
                <input 
                  type="text" 
                  maxLength={19} 
                  placeholder="0000 0000 0000 0000" 
                  value={cardData.number}
                  onChange={(e) => { handleCardNumber(e); handleCardChange('number', e.target.value); }} 
                  className={`input-custom w-full transition-colors ${isCardNumberError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                />
                {isCardNumberError && <span className="text-xs text-red-500 mt-1 block">Número de cartão inválido</span>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nome do titular *</label>
                <input 
                  type="text" 
                  placeholder="Digite o nome impresso no cartão" 
                  value={cardData.name} 
                  onChange={(e) => handleCardChange('name', e.target.value.toUpperCase())}
                  className={`input-custom w-full transition-colors ${isCardNameError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                />
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">Validade *</label>
                  <input 
                    type="text" 
                    maxLength={5} 
                    placeholder="MM/AA" 
                    value={cardData.expiry}
                    onChange={(e) => { handleExpiry(e); handleCardChange('expiry', e.target.value); }}    
                    className={`input-custom w-full transition-colors ${isExpiryError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                  />
                  {isExpiryError && <span className="text-xs text-red-500 mt-1 block">Data inválida</span>}
                </div>
                
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">CVV *</label>
                  <input 
                    type="text" 
                    maxLength={4} 
                    placeholder="123" 
                    value={cardData.cvv}
                    onChange={(e) => handleCardChange('cvv', formatNumbersOnly(e.target.value))}
                    className={`input-custom w-full transition-colors ${isCvvError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="saveCard"
                  checked={savePaymentMethod}
                  onChange={(e) => setSavePaymentMethod(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
                />
                <label htmlFor="saveCard" className="text-sm font-medium cursor-pointer select-none text-gray-700">
                  Salvar este cartão para compras futuras
                </label>
              </div>
            </div>
          )}

          <div className="md:col-span-2 mt-2">
                <label className="block text-sm font-medium mb-1">Parcelamento *</label>
                <select 
                  value={cardData.installments} 
                  onChange={(e) => handleCardChange('installments', e.target.value)} 
                  className="input-custom w-full bg-white cursor-pointer"
                >
                  {installmentsOptions.length > 0 ? (
                    installmentsOptions.map((option: any) => (
                      <option key={option.installments} value={option.installments}>
                          {option.recommended_message} 
                      </option>
                    ))
                  ): (
                    <option value="1">1x de R$ {total.toFixed(2).replace('.', ',')}</option>
                  )}
                </select>
              </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-8 mt-4 text-black">
        <h3 className="text-lg font-bold mb-4">Endereço de cobrança</h3>
        
        <div className="flex items-center gap-2 mb-6">
          <input 
            type="checkbox" 
            id="sameAsDelivery"
            checked={sameAsDelivery}
            onChange={(e) => setSameAsDelivery(e.target.checked)}
            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
          />
          <label htmlFor="sameAsDelivery" className="text-sm font-medium cursor-pointer select-none">
            O endereço de cobrança é o mesmo da entrega
          </label>
        </div>

        {!sameAsDelivery && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-inner animate-in fade-in">
            <h4 className="font-bold text-sm mb-4 text-gray-600 uppercase tracking-wide">Dados de Cobrança</h4>
            <AddressForm 
                data={billingData} 
                onChange={handleBillingChange} 
                saveAddress={saveBillingAddress} 
                onSaveAddressChange={setSaveBillingAddress}
            />
          </div>
        )}
      </div>

    </div>
  );
}