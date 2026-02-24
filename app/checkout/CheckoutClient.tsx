"use client"

import { CartItemType, CheckoutProvider, useCheckout } from "@/app/context/CheckoutContext";
import { Lock, Truck, CreditCard, ShoppingCart, MapPin } from "lucide-react";
import Link from "next/link";
import { AddressForm } from "../components/checkout/AdressForm";
import { ShippingOption, ShippingOptions } from "../components/checkout/ShippingOptions";
import { PaymentStep } from "../components/checkout/PaymentStep";
import { ConfirmationStep } from "../components/checkout/ConfirmationStep";
import { useEffect, useState } from "react";
import { isValidCreditCardNumber, isValidExpiryDate } from "../lib/formaters/formaters";
import { getUserAddresses } from "../actions/adress";
import { addressSchema } from "../lib/validators/address";
import { AddressStep } from "../components/checkout/AddressStep";
import { cpf } from "cpf-cnpj-validator";

function CheckoutStepper() {
  const { currentStep, setCurrentStep } = useCheckout();
  
  const steps = [
    { num: 1, label: "Informações de entrega", icon: Truck },
    { num: 2, label: "Pagamento", icon: CreditCard },
    { num: 3, label: "Confirmação", icon: ShoppingCart },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 mb-12">
      <div className="relative flex items-start justify-between">

        <div className="absolute top-8 left-[16%] right-[16%] h-[2px] bg-[#E5E5E5] z-0">
            <div 
                className="h-full bg-[#333333] transition-all duration-500 ease-in-out" 
                style={{ width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%' }}
            ></div>
        </div>

        {steps.map((step) => {
          const isActive = currentStep === step.num;
          const isPast = currentStep > step.num;
          const Icon = step.icon;

          const isClickable = isPast;

          return (
            <div key={step.num} className={`flex flex-col items-center w-1/3 z-10 ${isClickable ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}
              onClick={() => isClickable && setCurrentStep(step.num)}
            >
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-300
                  ${isActive || isPast 
                    ? "bg-[#333333] text-white"
                    : "bg-[#E5E5E5] text-black" 
                  }
                `}
              >
                <Icon size={28} />
              </div>

              <span 
                className={`text-sm text-center mt-3 max-w-[120px] 
                  ${isActive || isPast ? "text-black font-bold" : "text-gray-500 font-medium"}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
}

function StepRenderer() {
  const { currentStep } = useCheckout();
  

  switch (currentStep) {
    case 1:
      return <AddressStep/>
    case 2:
      return <PaymentStep/>
    case 3:
      return <ConfirmationStep/>
    default:
      return null;
  }
}

function CheckoutSummary() {
    const { currentStep, setCurrentStep, 
      shippingFee, deliveryData, 
      paymentMethod, sameAsDelivery, 
      billingData, cardData,
      savedCardId, 
      subtotal,
      total,
      pixDiscount,
      finalTotal,
    } = useCheckout();

    const addressValidation = addressSchema.safeParse(deliveryData);
    const isAddressValid = addressValidation.success;

    const isCpfValid = deliveryData.cpf ? cpf.isValid(deliveryData.cpf) : false;

    const isPaymentValid = () => {
        const isBillingValid = sameAsDelivery || addressSchema.safeParse(billingData).success;
        
        if (paymentMethod === 'PIX') return isBillingValid;
        
        if (paymentMethod === 'CREDIT_CARD') {
            if (savedCardId) return isBillingValid; 

            const isCardValid = 
                isValidCreditCardNumber(cardData.number) && 
                cardData.name.trim().length > 3 && 
                isValidExpiryDate(cardData.expiry) && 
                cardData.cvv.length >= 3;

            return isCardValid && isBillingValid;
        }
        return false;
    };
    
    const canProceedFromStep1 = isAddressValid && isCpfValid && shippingFee > 0;
    const canProceedFromStep2 = isPaymentValid();

    return (
        <div className="bg-[#999999] text-white p-6 rounded-xl sticky top-8">
            <h2 className="text-xl font-bold mb-4">Resumo do pedido:</h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-200">Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="flex justify-between">
                    <span className="text-gray-200">Frete:</span>
                    <span>{shippingFee === 0 ? "A calcular" : `R$ ${shippingFee.toFixed(2).replace('.', ',')}`}</span>
                </div>

                {paymentMethod === 'PIX' && pixDiscount > 0 && (
                    <div className="flex justify-between text-[#82FF95] font-bold">
                        <span>Desconto PIX (5%):</span>
                        <span>- R$ {pixDiscount.toFixed(2).replace('.', ',')}</span>
                    </div>
                )}
            </div>
            
            <hr className="my-4 border-white/20" />
            
            <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
            </div>

            {currentStep === 3 && paymentMethod === 'PIX' ? (
                <div className="bg-gray-500 text-white text-center p-4 rounded-md mt-6 animate-in fade-in">
                    <p className="text-sm font-medium">Você será redirecionado após o pagamento.</p>
                </div>
            ) : (
                <button 
                    disabled={(currentStep === 1 && !canProceedFromStep1) || (currentStep === 2 && !canProceedFromStep2)}
                    onClick={() => {
                        if (currentStep === 1) setCurrentStep(2);
                        
                        if (currentStep === 2) {
                            if (paymentMethod === 'PIX') {
                                // Para pix, gera QR Code e passa para a proxima pagina
                                console.log("Gerando PIX na API..."); 
                                setCurrentStep(3);
                            } else {
                                setCurrentStep(3); 
                            }
                        }

                        if (currentStep === 3 && paymentMethod === 'CREDIT_CARD') {
                            console.log("Processando Cartão e Salvando no Banco...");
                            // Redirecionaria para uma página de sucesso `/checkout/success`
                        }
                    }}
                    className={`w-full font-bold py-4 rounded-md transition-colors flex justify-center items-center gap-2 mt-6
                        ${(currentStep === 1 && !canProceedFromStep1) || (currentStep === 2 && !canProceedFromStep2)
                            ? 'bg-gray-500 cursor-not-allowed text-gray-300' 
                            : currentStep === 3 
                                ? 'bg-[#12581D] hover:bg-[#0C3C14] text-white' 
                                : 'bg-[#333333] hover:bg-black text-white' 
                        }
                    `}
                >
                    {currentStep === 1 ? "Prosseguir para o pagamento" : currentStep === 2 ? "Ir para revisão" : "Finalizar pedido"}
                    <span className="text-xl leading-none mb-1">›</span>
                </button>
            )}

            {currentStep === 1 && !canProceedFromStep1 && (
                <p className="text-xs text-center mt-3 text-[#5A0000] font-bold animate-in fade-in">
                    {!isAddressValid 
                        ? "Preencha todos os campos obrigatórios (*) do endereço."
                        : !isCpfValid
                        ? "O CPF informado é inválido."
                        : "Selecione uma opção de frete para continuar."}
                </p>
            )}

            {currentStep === 2 && !canProceedFromStep2 && (
                <p className="text-xs text-center mt-3 text-[#5A0000] font-bold animate-in fade-in">
                    {paymentMethod === 'PIX'
                        ? "Preencha os dados de cobrança corretamente."
                        : "Verifique os dados do cartão de crédito informados."}
                </p>
            )}

            <div className="mt-4 text-center">
                {currentStep === 1 ? (
                    <Link href="/cart" className="text-sm text-gray-200 hover:text-white underline transition-colors">
                        Voltar para o carrinho
                    </Link>
                ) : currentStep === 2 ? (
                    <button 
                        onClick={() => setCurrentStep(1)}
                        className="text-sm text-gray-200 hover:text-white underline transition-colors"
                    >
                        Voltar para endereço
                    </button>
                ) : currentStep === 3 && paymentMethod === 'CREDIT_CARD' ? (
                     <button 
                        onClick={() => setCurrentStep(2)}
                        className="text-sm text-gray-200 hover:text-white underline transition-colors"
                    >
                        Voltar para pagamento
                    </button>
                ) : null}
            </div>
        </div>
    )
}

interface CheckoutClientProps {
  initialCartItems: CartItemType[];
}

export default function CheckoutClient({ initialCartItems }: CheckoutClientProps) {
  return (
    // Passamos os itens que vieram do servidor para alimentar a "Nuvem"
    <CheckoutProvider initialCartItems={initialCartItems}>
      <div className="min-h-screen bg-white text-black">
        
        <header className="bg-[#999999] text-white py-4 px-8 relative flex items-center h-16">
            <div className="font-bold text-2xl text-black">
                <Link href="/catalog">(LOGO)</Link>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 font-bold text-2xl">
                <Lock size={24} /> Checkout
            </div>
        </header>

        <div className="max-w-6xl mx-auto px-4">
          <CheckoutStepper />

          <div className="flex flex-col lg:flex-row gap-12 pb-24">
            <div className="flex-1">
              <StepRenderer />
            </div>

            <div className="w-full lg:w-[400px]">
              <CheckoutSummary />
            </div>
          </div>
        </div>

      </div>
    </CheckoutProvider>
  );
}