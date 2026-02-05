"use client"
import PasswordModal from "@/app/components/modals/PasswordModal";
import { ArrowRight, ImageIcon, Plus } from "lucide-react";
import { useState } from "react";

export default function AddProductPage() {
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col"> 
      
      <header className="flex justify-between items-center p-6 text-white bg-[#999999]">
        <div className="text-2xl font-bold">(LOGO)</div>
        <h1 className="text-2xl">Adicionar produto</h1>
        <div className="w-10"></div> 
      </header>

      <main className="flex-1 flex justify-center items-start p-6">
        <div className="bg-white w-full max-w-4xl rounded-xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row gap-8">
  
                <div className="w-full md:w-1/3">
                    <div className="aspect-square bg-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
                    <div className="bg-gray-700 p-6 rounded-xl mb-4">
                        <ImageIcon size={48} className="text-white" />
                    </div>
                    <span className="text-lg font-medium text-black">Adicionar imagem +</span>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-black">Nome do produto *</label>
                        <input type="text" className="input-custom w-full" placeholder="Ex: Camisa preta"></input>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-black">Descrição *</label>
                        <input type="text" className="input-custom w-full" placeholder="Ex: Uma camisa estilosa..."></input>
                    </div>

                    <div className="flex flex-row gap-4">
                        <div className="flex-1 flex-col">
                            <label className="mb-1 font-medium text-black">Preço *</label>
                            <input type="number" className="input-custom w-full" placeholder="Ex: R$99,99"></input>
                        </div>
                        <div className="flex-1 flex-col">
                            <label className="mb-1 font-medium text-black">Quantidade *</label>
                            <input type="number" className="input-custom w-full" placeholder="Ex: 90"></input>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-black">Categoria *</label>
                        <input type="text" className="input-custom w-full" placeholder="Ex: Uma camisa estilosa..."></input>
                    </div>
                </div>
            </div>
            <div className="flex justify-center mt-8">
                <button className="btn-primary" onClick={() => setPasswordModalOpen(true)}>
                    Criar produto
                    <Plus></Plus>
                </button>
            </div>
        </div>
      </main>

      {passwordModalOpen && (
        <PasswordModal
            isOpen={passwordModalOpen}
            handleClose={() => setPasswordModalOpen(!passwordModalOpen)}
        >
            <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-bold text-black mb-2">
                    Confirme sua identidade
                </h2>

                <h3 className="text-black/70 mb-5">
                    Para criar o produto, digite sua senha:
                </h3>

                <div className="relative mb-5">
                    <input name="password" type={showPassword ? "text" : "password"} 
                        placeholder="Digite sua senha" className="input-custom" required 
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        )}
                    </button>
                </div>

                <button className="btn-primary">
                    Avançar
                    <ArrowRight></ArrowRight>
                </button>
            </div>
        </PasswordModal>
      )}
    </div>
  );
}