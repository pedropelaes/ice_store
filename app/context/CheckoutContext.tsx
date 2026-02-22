"use client"

import { createContext, useContext, useState, ReactNode } from "react";

export interface DeliveryData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  recipientName: string;
  phone: string;
  cpf: string; 
}

interface CheckoutContextType {
    saveAddress: boolean;
    setSaveAddress: (save: boolean) => void;

    currentStep: number;
    setCurrentStep: (step: number) => void;

    deliveryData: DeliveryData;
    setDeliveryData: React.Dispatch<React.SetStateAction<DeliveryData>>; // Tipagem mais precisa para o React state

    shippingFee: number;
    setShippingFee: (fee: number) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({
    cep: "", street: "", number: "", complement: "",
    neighborhood: "", city: "", state: "", recipientName: "", phone: "", cpf: ""
  });

  const [shippingFee, setShippingFee] = useState<number>(0);

  const [saveAddress, setSaveAddress] = useState(false);

  return (
    <CheckoutContext.Provider 
      value={{ 
        currentStep, setCurrentStep, 
        deliveryData, setDeliveryData,
        shippingFee, setShippingFee,
        saveAddress, setSaveAddress, 
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout deve ser usado dentro de um CheckoutProvider");
  }
  return context;
}