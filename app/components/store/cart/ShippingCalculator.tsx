"use client"

import { useState } from "react";

export function ShippingCalculator() {
  const [cep, setCep] = useState("");

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrar com API de frete (Correios/Melhor Envio)
    alert(`Calculando frete para: ${cep}`);
  };

  return (
    <form onSubmit={handleCalculate} className="mt-6 border-t border-gray-300/30 pt-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="CEP de entrega*" 
            value={cep}
            onChange={(e) => setCep(e.target.value)}
            maxLength={9}
            className="w-full bg-white/90 border border-gray-300 text-black px-3 py-2 rounded-md outline-none text-sm focus:ring-2 focus:ring-green-600"
            required
          />
        </div>
        <button 
          type="submit"
          className="bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-800 transition-colors"
        >
          Calcular
        </button>
      </div>
      <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noreferrer" className="text-xs text-white/70 underline mt-2 inline-block hover:text-white">
        Não sei o meu CEP
      </a>
    </form>
  );
}