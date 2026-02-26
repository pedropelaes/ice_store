"use client"

import { useSearchParams } from "next/navigation";
import { createContext, useContext, useState, ReactNode } from "react";

export type PaymentMethodType = 'PIX' | 'CREDIT_CARD';

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

export interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  installments: string;
}

export interface CartItemType {
  id: number;
  quantity: number;
  unit_price: number;
  size: string;
  maxStock: number;
  active: string;
  product: {
    id: number;
    name: string;
    image_url: string;
  };
}

export interface PixDataType {
  qrCode: string;
  qrCodeBase64: string;
  paymentId?: number | string;
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

  paymentMethod: PaymentMethodType;
  setPaymentMethod: (method: PaymentMethodType) => void;

  sameAsDelivery: boolean;
  setSameAsDelivery: (same: boolean) => void;

  billingData: DeliveryData;
  setBillingData: React.Dispatch<React.SetStateAction<DeliveryData>>;

  cardData: CardData;
  setCardData: React.Dispatch<React.SetStateAction<CardData>>;

  saveBillingAddress: boolean;
  setSaveBillingAddress: (save: boolean) => void;

  savePaymentMethod: boolean;
  setSavePaymentMethod: (save: boolean) => void;

  savedCardId: number | null;
  setSavedCardId: (id: number | null) => void;

  cartItems: CartItemType[];
  subtotal: number;
  total: number;
  pixDiscount: number;
  finalTotal: number;

  pixData: PixDataType | null;
  setPixData: React.Dispatch<React.SetStateAction<PixDataType | null>>;

  orderedAt: Date | null;
  setOrderedAt: React.Dispatch<React.SetStateAction<Date | null>>;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

interface CheckoutProviderProps {
  children: ReactNode;
  initialCartItems: CartItemType[]; 
}

export function CheckoutProvider({ children, initialCartItems }: CheckoutProviderProps) {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const initialCep = searchParams.get("cep") || "";
  const initialFee = searchParams.get("fee") ? Number(searchParams.get("fee")) : 0;
  
  // envio
  const [deliveryData, setDeliveryData] = useState<DeliveryData>({
    cep: initialCep, street: "", number: "", complement: "",
    neighborhood: "", city: "", state: "", recipientName: "", phone: "", cpf: ""
  });
  const [shippingFee, setShippingFee] = useState<number>(initialFee);
  const [saveAddress, setSaveAddress] = useState(false);

  // pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CREDIT_CARD');
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [billingData, setBillingData] = useState<DeliveryData>({
    cep: "", street: "", number: "", complement: "",
    neighborhood: "", city: "", state: "", recipientName: "", phone: "", cpf: ""
  });
  const [cardData, setCardData] = useState<CardData>({
    number: "", name: "", expiry: "", cvv: "", installments: "1"
  });
  const [saveBillingAddress, setSaveBillingAddress] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [savedCardId, setSavedCardId] = useState<number | null>(null);
  const [pixData, setPixData] = useState<PixDataType | null>(null);

  // calculos
  const subtotal = initialCartItems.reduce((acc, item) => {
      return acc + (item.unit_price * item.quantity);
  }, 0);

  const total = subtotal + shippingFee;

  const pixDiscount = paymentMethod === 'PIX' ? total * 0.05 : 0;

  const finalTotal = total - pixDiscount;


  const [orderedAt, setOrderedAt] = useState<Date | null>(null);
  return (
    <CheckoutContext.Provider 
      value={{ 
        currentStep, setCurrentStep, 
        deliveryData, setDeliveryData,
        shippingFee, setShippingFee,
        saveAddress, setSaveAddress,
        paymentMethod, setPaymentMethod,
        sameAsDelivery, setSameAsDelivery,
        billingData, setBillingData,
        cardData, setCardData,
        saveBillingAddress, setSaveBillingAddress,
        savePaymentMethod, setSavePaymentMethod,
        savedCardId, setSavedCardId,
        cartItems: initialCartItems,
        subtotal,
        total,
        pixDiscount,
        finalTotal,
        pixData, setPixData,
        orderedAt, setOrderedAt
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