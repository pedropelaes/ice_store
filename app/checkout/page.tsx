"use client"

import { CheckoutProvider, useCheckout } from "@/app/context/CheckoutContext";
import { Lock, Truck, CreditCard, ShoppingCart, MapPin } from "lucide-react";
import Link from "next/link";
import { AddressForm } from "../components/checkout/AdressForm";
import { ShippingOptions, ShippingOption } from "../components/checkout/ShippingOptions";
import { useEffect, useState } from "react";
import { getUserAddresses } from "../actions/adress";

// --- SUB-COMPONENTES ---

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
  const { currentStep, deliveryData, setDeliveryData, setShippingFee, saveAddress, setSaveAddress } = useCheckout();
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  
  useEffect(() => {
    async function fetchAddresses() {
      const addresses = await getUserAddresses();
      setSavedAddresses(addresses);
      setIsLoadingAddresses(false);
      
      // Opcional: Se ele tiver um endereço salvo, preenche automaticamente o primeiro
      /*
      if (addresses.length > 0 && !deliveryData.cep) {
         handleSelectSavedAddress(addresses[0]);
      }
      */
    }
    fetchAddresses();
  }, []);

  const handleSelectSavedAddress = (addr: any) => {
    setDeliveryData({
      cep: addr.zip_code,
      street: addr.street,
      number: addr.number,
      complement: addr.complement || "",
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
      recipientName: addr.recipient_name,
      phone: addr.phone,
      cpf: deliveryData.cpf
    });
    setSaveAddress(false); 
    setShippingFee(0);
    setSelectedShippingId(null);
  };

  const handleDeliveryChange = (field: keyof typeof deliveryData, value: string) => {
    setDeliveryData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShippingSelect = (option: ShippingOption) => {
    setSelectedShippingId(option.id);
    setShippingFee(option.price); 
  };

  switch (currentStep) {
    case 1:
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* CARDS DE ENDEREÇOS SALVOS */}
          {!isLoadingAddresses && savedAddresses.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Seus Endereços</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => (
                  <div 
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="border-2 border-gray-200 rounded-xl p-4 cursor-pointer hover:border-black hover:shadow-md transition-all group relative bg-white"
                  >
                    {addr.is_default && (
                      <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">Padrão</span>
                    )}
                    <div className="flex items-center gap-2 font-bold mb-1 text-black">
                      <MapPin size={16} className="text-gray-400 group-hover:text-black transition-colors" /> 
                      {addr.recipient_name}
                    </div>
                    <p className="text-sm text-gray-600">{addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}</p>
                    <p className="text-sm text-gray-600">{addr.city} - {addr.state}, {addr.zip_code}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 my-6">
                 <div className="h-px bg-gray-300 flex-1"></div>
                 <span className="text-sm text-gray-400 font-medium">OU NOVO ENDEREÇO</span>
                 <div className="h-px bg-gray-300 flex-1"></div>
              </div>
            </div>
          )}

          <AddressForm 
            data={deliveryData} 
            onChange={handleDeliveryChange} 
            saveAddress={saveAddress}
            onSaveAddressChange={setSaveAddress}
          />
          
          <ShippingOptions 
             cep={deliveryData.cep} 
             selectedOptionId={selectedShippingId}
             onSelect={handleShippingSelect}
          />
        </div>
      );
    case 2:
      return <div className="border-2 border-dashed border-gray-300 p-10 text-center text-gray-500 rounded-xl">Opções de Pagamento</div>;
    case 3:
      return <div className="border-2 border-dashed border-gray-300 p-10 text-center text-gray-500 rounded-xl">Confirmação</div>;
    default:
      return null;
  }
}

function CheckoutSummary() {
    const { currentStep, setCurrentStep, shippingFee, deliveryData } = useCheckout();

    const subtotal = 99.99;
    const total = subtotal + shippingFee;

    const isAddressValid = () => {
        return (
            deliveryData.cep.length === 9 &&
            deliveryData.street.trim() !== "" &&
            deliveryData.number.trim() !== "" &&
            deliveryData.neighborhood.trim() !== "" &&
            deliveryData.city.trim() !== "" &&
            deliveryData.state.trim() !== "" &&
            deliveryData.recipientName.trim() !== "" &&
            deliveryData.cpf.length === 14 &&
            deliveryData.phone.length >= 14 
        );
    };
    
    const canProceedFromStep1 = isAddressValid() && shippingFee > 0;

    return (
        <div className="bg-[#999999] text-white p-6 rounded-xl sticky top-8">
            <h2 className="text-xl font-bold mb-4">Resumo do pedido:</h2>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-200">Subtotal:</span>
                    <span>R$ 99,99</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-200">Frete:</span>
                    <span>{shippingFee === 0 ? "A calcular" : `R$ ${shippingFee.toFixed(2).replace('.', ',')}`}</span>
                </div>
            </div>
            
            <hr className="my-4 border-white/20" />
            
            <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>

            <button 
                disabled={!canProceedFromStep1 && currentStep === 1}
                onClick={() => setCurrentStep(currentStep + 1)}
                className="w-full bg-[#12581D] hover:bg-[#0C3C14] disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-md transition-colors flex justify-center items-center gap-2"
            >
                {currentStep === 1 ? "Prosseguir para o pagamento" : "Finalizar pedido"}
                <span className="text-xl leading-none mb-1">›</span>
            </button>
            
            {currentStep === 1 && !canProceedFromStep1 && (
                <p className="text-xs text-center mt-3 text-[#5A0000] font-bold">
                    {!isAddressValid() 
                        ? "Preencha todos os campos obrigatórios (*) do endereço." 
                        : "Selecione uma opção de frete."}
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
                ) : null}
            </div>
        </div>
    )
}


export default function CheckoutPage() {
  return (
    <CheckoutProvider>
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
            {/* Esquerda: Conteúdo dinâmico que muda (Formulários) */}
            <div className="flex-1">
              <StepRenderer />
            </div>

            {/* Direita: Resumo Fixo */}
            <div className="w-full lg:w-[400px]">
              <CheckoutSummary />
            </div>
          </div>
        </div>

      </div>
    </CheckoutProvider>
  );
}