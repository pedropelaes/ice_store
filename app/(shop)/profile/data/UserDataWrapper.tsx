"use client"

import { useState } from "react";
import { User, Mail, CreditCard, Calendar, Edit2, Loader2 } from "lucide-react";
import PasswordModal from '@/app/components/modals/PasswordModal';
import { capitalizeWords, formatLettersOnly } from "@/app/lib/formaters/formaters";
import { updateUserData } from "@/app/actions/userData";

interface UserData {
  id: number;
  name: string;
  lastName: string;
  email: string;
  cpf: string;
  birthDate: Date;
}

export default function UserDataWrapper({ initialData }: { initialData: UserData }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: initialData.name,
    lastName: initialData.lastName,
    birthDate: new Date(initialData.birthDate).toISOString().split('T')[0] 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name" || name === "lastName") {
        newValue = formatLettersOnly(value);
        newValue = capitalizeWords(newValue);
    }

    setFormData({ 
        ...formData, 
        [name]: newValue 
    });
};

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (formData.name.trim().length < 2 || formData.lastName.trim().length < 2) {
      setErrorMsg("Nome e sobrenome são obrigatórios.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await updateUserData(formData);

      if (response.success) {
        setIsEditModalOpen(false);
        setSuccessMessage("Alterações salvas!")
      } else {
        setErrorMsg(response.error || "Erro ao atualizar os dados.");
      }
    } catch (error) {
      setErrorMsg("Falha de comunicação com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDate = new Date(initialData.birthDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'});

  return (
    <>
        {successMessage &&
            <p className="text-green-600 text-xs">
                {successMessage}
            </p>
        }
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative">
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors flex items-center gap-2"
        >
          <Edit2 size={18} />
          <span className="text-sm font-medium hidden sm:block">Editar</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
          
          <div className="flex items-start gap-3">
            <div className="bg-gray-100 p-2 rounded-md text-gray-600"><User size={20} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Nome completo</p>
              <p className="text-base font-bold text-gray-900">{initialData.name} {initialData.lastName}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-gray-100 p-2 rounded-md text-gray-600"><Mail size={20} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">E-mail</p>
              <p className="text-base font-bold text-gray-900">{initialData.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-gray-100 p-2 rounded-md text-gray-600"><CreditCard size={20} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">CPF</p>
              <p className="text-base font-bold text-gray-900">{initialData.cpf}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-gray-100 p-2 rounded-md text-gray-600"><Calendar size={20} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Data de nascimento</p>
              <p className="text-base font-bold text-gray-900">{formattedDate}</p>
            </div>
          </div>

        </div>
      </div>

      {isEditModalOpen && (
        <PasswordModal 
          isOpen={isEditModalOpen} 
          handleClose={() => {
            setIsEditModalOpen(false);
            setErrorMsg("");
            setFormData({
              name: initialData.name,
              lastName: initialData.lastName,
              birthDate: new Date(initialData.birthDate).toISOString().split('T')[0] 
            });
          }}
        >
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Editar Dados Pessoais
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:ring-black focus:border-black outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
                  <input 
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 text-black rounded-md focus:ring-black focus:border-black outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                <input 
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-black focus:ring-black focus:border-black outline-none"
                  required
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mt-4">
                <p className="text-xs text-gray-500 text-center">
                  Para alterar seu CPF ou E-mail, por favor entre em contato com o suporte por motivos de segurança.
                </p>
              </div>

              {errorMsg && (
                <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded-md text-center">
                  {errorMsg}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isLoading}
                  className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors flex items-center justify-center min-w-[120px]"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </PasswordModal>
      )}
    </>
  );
}