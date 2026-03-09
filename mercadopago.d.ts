declare global {
  interface InstallmentOption {
    installments: number;
    installment_amount: number;
    total_amount: number;
    recommended_message: string;
  }

  interface MPInstallment {
    payment_method_id: string;
    issuer: { id: string; name: string };
    payer_costs: InstallmentOption[];
  }

  interface MPCardTokenParams {
    cardNumber: string;
    cardholderName: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }

  interface MercadoPagoInstance {
    createCardToken(params: MPCardTokenParams): Promise<{ id: string } | undefined>;
    getInstallments(params: { amount: string; bin: string }): Promise<MPInstallment[] | undefined>;
  }

  interface Window {
    MercadoPago?: new (publicKey: string) => MercadoPagoInstance;
  }
}

export {};