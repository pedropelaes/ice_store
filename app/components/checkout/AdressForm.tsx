"use client"

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { formatCPF, formatNumbersOnly } from "@/app/lib/formaters/formaters"; // Ajuste o caminho se necessário

export interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  recipientName: string;
  cpf: string;
  phone: string;
}

interface AddressFormProps {
  data: AddressData;
  onChange: (field: keyof AddressData, value: string) => void;
  saveAddress: boolean;
  onSaveAddressChange: (save: boolean) => void;
}

export function AddressForm({ data, onChange, saveAddress, onSaveAddressChange }: AddressFormProps) {
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // --- MÁSCARAS DE INPUT REUTILIZANDO SUAS FUNÇÕES ---

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = formatNumbersOnly(e.target.value); 
    if (value.length > 5) value = value.replace(/^(\d{5})(\d)/, "$1-$2");
    
    onChange("cep", value);

    // AUTO-COMPLETAR COM VIACEP
    if (value.replace(/\D/g, "").length === 8) {
      setIsLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${value.replace(/\D/g, "")}/json/`);
        const viaCepData = await res.json();
        
        if (!viaCepData.erro) {
          onChange("street", viaCepData.logradouro);
          onChange("neighborhood", viaCepData.bairro);
          onChange("city", viaCepData.localidade);
          onChange("state", viaCepData.uf);
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange("cpf", formatCPF(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = formatNumbersOnly(e.target.value);
    if (value.length > 10) value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    else if (value.length > 5) value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    else if (value.length > 2) value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    onChange("phone", value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-black w-full">
      
      {/* LINHA 1: CEP (Ocupa 5 colunas no Desktop para não ficar gigante) */}
      <div className="md:col-span-5 relative">
        <label className="block text-sm font-medium mb-1">CEP *</label>
        <input 
          type="text" 
          value={data.cep} 
          onChange={handleCepChange} 
          maxLength={9}
          placeholder="Ex: 00000-000"
          className="input-custom w-full"
        />
        {isLoadingCep && <Loader2 size={16} className="absolute right-3 top-9 animate-spin text-gray-400" />}
      </div>
      <div className="hidden md:block md:col-span-7"></div> {/* Espaço vazio para alinhar à esquerda */}

      {/* LINHA 2: Rua (8 col) e Número (4 col) */}
      <div className="md:col-span-8">
        <label className="block text-sm font-medium mb-1">Endereço *</label>
        <input 
          type="text" 
          value={data.street} 
          onChange={(e) => onChange("street", e.target.value)} 
          placeholder="Ex: Rua Monte Alto"
          className="input-custom w-full bg-gray-50/50" // Mantemos o bg leve para indicar que é auto-preenchido
        />
      </div>
      <div className="md:col-span-4">
        <label className="block text-sm font-medium mb-1">Número *</label>
        <input 
          type="text" 
          value={data.number} 
          onChange={(e) => onChange("number", e.target.value)} 
          placeholder="XXX"
          className="input-custom w-full"
        />
      </div>

      {/* LINHA 3: Complemento e Bairro (Metade / Metade) */}
      <div className="md:col-span-6">
        <label className="block text-sm font-medium mb-1">Complemento (opcional)</label>
        <input 
          type="text" 
          value={data.complement} 
          onChange={(e) => onChange("complement", e.target.value)} 
          placeholder="Ex: Apto 42, Casa azul"
          className="input-custom w-full"
        />
      </div>
      <div className="md:col-span-6">
        <label className="block text-sm font-medium mb-1">Bairro *</label>
        <input 
          type="text" 
          value={data.neighborhood} 
          onChange={(e) => onChange("neighborhood", e.target.value)} 
          placeholder="Seu bairro"
          className="input-custom w-full bg-gray-50/50"
        />
      </div>

      {/* LINHA 4: Cidade e Estado (Metade / Metade) */}
      <div className="md:col-span-6">
        <label className="block text-sm font-medium mb-1">Cidade *</label>
        <input 
          type="text" 
          value={data.city} 
          onChange={(e) => onChange("city", e.target.value)} 
          placeholder="Sua cidade"
          className="input-custom w-full bg-gray-50/50"
        />
      </div>
      <div className="md:col-span-6">
        <label className="block text-sm font-medium mb-1">Estado *</label>
        <input 
          type="text" 
          value={data.state} 
          onChange={(e) => onChange("state", e.target.value)} 
          placeholder="UF"
          maxLength={2}
          className="input-custom w-full bg-gray-50/50 uppercase"
        />
      </div>

      <div className="col-span-full border-t border-gray-200 my-2"></div>

      {/* LINHA 5: Nome do Destinatário (Full Width) */}
      <div className="col-span-full">
        <label className="block text-sm font-medium mb-1">Nome do destinatário *</label>
        <input 
          type="text" 
          value={data.recipientName} 
          onChange={(e) => onChange("recipientName", e.target.value)} 
          placeholder="Digite o nome de quem receberá o produto"
          className="input-custom w-full"
        />
      </div>

      {/* LINHA 6: CPF e Telefone (Metade / Metade) */}
      <div className="md:col-span-6">
        <label className="block text-sm font-medium mb-1">CPF do Comprador *</label>
        <input 
          type="text" 
          value={data.cpf} 
          onChange={handleCpfChange} 
          placeholder="000.000.000-00"
          className="input-custom w-full"
        />
      </div>
      <div className="md:col-span-6">
        <label className="block text-sm font-medium mb-1">Telefone / WhatsApp *</label>
        <input 
          type="text" 
          value={data.phone} 
          onChange={handlePhoneChange} 
          placeholder="(11) 99999-9999"
          className="input-custom w-full"
        />
      </div>

        <div className="col-span-full mt-4 flex items-center gap-2">
        <input 
          type="checkbox" 
          id="saveAddress"
          checked={saveAddress}
          onChange={(e) => onSaveAddressChange(e.target.checked)}
          className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500 cursor-pointer"
        />
        <label htmlFor="saveAddress" className="text-sm font-medium cursor-pointer select-none">
          Salvar este endereço para compras futuras
        </label>
      </div>
    </div>
  );
}