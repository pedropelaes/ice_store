'use client';

import { Pencil, Trash2 } from 'lucide-react';

export type Address = {
  id: number;
  is_default: boolean;
  recipient_name: string;
  phone: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
};

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  return (
    <div className={`p-5 rounded-lg border relative flex flex-col justify-between h-full bg-white shadow-sm transition-all ${
        address.is_default ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'
    }`}>
      
      {address.is_default && (
        <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-bl-lg rounded-tr-lg">
          Padrão
        </span>
      )}

      <div>
        <div className="mb-3">
          <p className="font-bold text-gray-900 text-lg">
            {address.street}, {address.number}
          </p>
          {address.complement && (
            <p className="text-sm text-gray-500">{address.complement}</p>
          )}
        </div>

        <div className="text-sm text-gray-700 space-y-1 mb-6">
          <p>{address.neighborhood} - {address.city}, {address.state}</p>
          <p>CEP: {address.zip_code} - {address.country}</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p><span className="font-semibold">Destinatário:</span> {address.recipient_name}</p>
            <p><span className="font-semibold">Telefone:</span> {address.phone}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
        <label className="flex items-center cursor-pointer group">
          <input
            type="radio"
            name="default_address"
            checked={address.is_default}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 cursor-pointer"
            readOnly // Removeremos o readOnly quando implementarmos a função de alterar o padrão
          />
          <span className="ml-2 text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            Tornar padrão
          </span>
        </label>

        <div className="flex gap-2">
          <button 
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Editar endereço"
            onClick={onEdit}
          >
            <Pencil size={18} />
          </button>
          
          <button 
            className="p-2 bg-red-500 text-red-200 hover:text-red-300 hover:bg-red-900 rounded-md transition-colors"
            title="Excluir endereço"
            onClick={onDelete}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}