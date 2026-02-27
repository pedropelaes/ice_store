"use client"

import { CartItemType, CheckoutProvider, useCheckout } from "@/app/context/CheckoutContext";
import { Lock, Truck, CreditCard, ShoppingCart, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { PaymentStep } from "../components/checkout/PaymentStep";
import { ConfirmationStep } from "../components/checkout/ConfirmationStep";
import { useEffect, useState } from "react";
import { isValidCreditCardNumber, isValidExpiryDate } from "../lib/formaters/formaters";
import { addressSchema } from "../lib/validators/address";
import { AddressStep } from "../components/checkout/AddressStep";
import { cpf } from "cpf-cnpj-validator";
import { changeOrderStatus, createOrderAndReserveStock, processCardPayment, verifyPaymentStatus } from "../actions/payment";
import Script from "next/script";
import { cleanCart } from "../actions/cart";
import { saveUserAddress, saveUserCard } from "../actions/checkout";
import { getUserAddresses } from "../actions/adress";

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
      cartItems,
      pixData, setPixData,
      orderedAt, setOrderedAt,
      savePaymentMethod, saveAddress
    } = useCheckout();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null); 

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

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (currentStep === 3 && paymentMethod === 'PIX' && pixData?.paymentId && orderId) {
            
            interval = setInterval(async () => {
                const status = await verifyPaymentStatus(Number(pixData.paymentId), orderId);
                console.log("Buscando status do pagamento")
                if (status.approved) {
                    clearInterval(interval); 
                    window.location.href = `/checkout/success?order=${orderId}`;
                }
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [currentStep, paymentMethod, pixData, orderId]);

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
                    disabled={(currentStep === 1 && !canProceedFromStep1) || (currentStep === 2 && !canProceedFromStep2) || isLoading}
                    onClick={async () => {
                        setErrorMsg(null); 

                        if (currentStep === 1) {
                            if(saveAddress){
                                saveUserAddress(deliveryData);
                            }

                            setCurrentStep(2);
                            return;
                        }
                        const formattedItems = cartItems.map((item) => ({
                            productId: Number(item.product.id),
                            size: item.size as any, 
                            quantity: item.quantity
                        }));

                        const payerData = {
                            firstName: deliveryData.recipientName.split(" ")[0] || "Nome",
                            lastName: deliveryData.recipientName.split(" ").slice(1).join(" ") || "Sobrenome",
                            cpf: deliveryData.cpf
                        };

                        if (currentStep === 2) {
                            setIsLoading(true);
                            try {
                                const response = await createOrderAndReserveStock({
                                    cartItems: formattedItems,
                                    paymentMethod,
                                    payer: payerData,
                                    addressData: deliveryData
                                });

                                if (response.success && response.orderId) {
                                    setOrderId(response.orderId);
                                    
                                    if (paymentMethod === 'PIX' && response.pixData) {
                                        setPixData(response.pixData); // Guarda o QR Code
                                    }
                                    if(!response.orderedAt) setOrderedAt(new Date());
                                    else setOrderedAt(new Date(response.orderedAt))
                                    setCurrentStep(3); // Avança para a etapa de Confirmação
                                } else {
                                    setErrorMsg(response.error || "Ocorreu um erro ao criar o pedido.");
                                }
                            } catch (error) {
                                console.error("Erro no fluxo:", error);
                                setErrorMsg("Erro de comunicação com o servidor.");
                            } finally {
                                setIsLoading(false);
                            }
                            return;
                        }

                        // --- NA ETAPA 3 (FINALIZAR PAGAMENTO CARTÃO) ---
                        if (currentStep === 3 && paymentMethod === 'CREDIT_CARD') {
                            setIsLoading(true);
                            try {
                                if (!orderId) {
                                    throw new Error("Erro ao obter ID do pedido");
                                }

                                let paymentResponse; 

                                if (savedCardId) {
                                    paymentResponse = await processCardPayment({
                                        savedCardId: savedCardId,
                                        installments: Number(cardData.installments || 1),
                                        payer: payerData,
                                        orderId: orderId.toString(),
                                        last4: cardData.number.slice(-4)
                                    });
                                } 
                                else {
                                    if (typeof (window as any).MercadoPago === 'undefined') {
                                        setErrorMsg("Conectando com a operadora. Por favor, aguarde e tente novamente.");
                                        setIsLoading(false);
                                        return; 
                                    }

                                    const mp = new (window as any).MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
                                    const [month, year] = cardData.expiry.split('/');
                                    
                                    const tokenResponse = await mp.createCardToken({
                                        cardNumber: cardData.number.replace(/\D/g, ''),
                                        cardholderName: cardData.name,
                                        cardExpirationMonth: month,
                                        cardExpirationYear: `20${year}`,
                                        securityCode: cardData.cvv,
                                        identificationType: 'CPF',
                                        identificationNumber: payerData.cpf.replace(/\D/g, '')
                                    });

                                    if (!tokenResponse || !tokenResponse.id) {
                                        throw new Error("Dados do cartão inválidos. Verifique as informações.");
                                    }

                                    const safeToken = tokenResponse.id;
                                    const bin = cardData.number.replace(/\D/g, '').substring(0, 6);
                                    const paymentMethods = await mp.getPaymentMethods({ bin: bin });
                                    
                                    if (!paymentMethods || paymentMethods.results.length === 0) {
                                        throw new Error("Não foi possível identificar a bandeira do cartão.");
                                    }

                                    const fetchedPaymentMethodId = paymentMethods.results[0].id;

                                    paymentResponse = await processCardPayment({
                                        token: safeToken,
                                        installments: Number(cardData.installments || 1),
                                        paymentMethodId: fetchedPaymentMethodId,
                                        payer: payerData,
                                        orderId: orderId.toString(),
                                        last4: cardData.number.slice(-4)
                                    });

                                    if (paymentResponse.success && savePaymentMethod) {
                                        await saveUserCard(cardData, safeToken, fetchedPaymentMethodId);
                                    }
                                }

                                if (paymentResponse && paymentResponse.success && paymentResponse.status === 'approved') {
                                    await cleanCart();
                                    window.location.href = `/checkout/success?order=${orderId}`;
                                } else {
                                    if (paymentResponse?.error) {
                                        setErrorMsg(paymentResponse.error);
                                    } else {
                                        setErrorMsg(`Pagamento recusado: ${paymentResponse?.statusDetail || 'Verifique com sua operadora.'}`);
                                    }
                                }

                            } catch (err) {
                                console.log(err)
                                setErrorMsg("Falha ao processar o cartão com a operadora.");
                            } finally {
                                setIsLoading(false);
                            }
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
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            Processando... <Loader2 className="w-5 h-5 animate-spin" />
                        </span>
                    ) : (
                        <>
                            {currentStep === 1 ? "Prosseguir para o pagamento" : currentStep === 2 ? "Ir para revisão" : "Finalizar pedido"}
                            <span className="text-xl leading-none mb-1">›</span>
                        </>
                    )}
                </button>
                
            )}

            {errorMsg && (
                <div className="bg-red-100 text-red-700 text-sm p-3 rounded-md mt-4 font-medium animate-in fade-in">
                    {errorMsg}
                </div>
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
            {process.env.NODE_ENV === 'development' && currentStep===3 && paymentMethod==='PIX' && (
                <button 
                    onClick={async () => {
                        // Força o redirecionamento ignorando o Mercado Pago
                        changeOrderStatus(true, orderId!)
                        cleanCart();
                        window.location.href = `/checkout/success?order=${orderId}`;
                    }}
                    className="bg-[#82FF95] text-black font-bold py-2 px-4 rounded-md mt-2 text-xs hover:bg-green-400 transition-colors"
                >
                    [DEV] Simular Pagamento PIX
                </button>
            )}
            
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
        <Script src="https://sdk.mercadopago.com/js/v2" strategy="afterInteractive" />

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