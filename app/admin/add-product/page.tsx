import Link from "next/link";
import { ArrowLeft, ImageIcon, Plus } from "lucide-react";

export default function AddProductPage() {
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
                <button className="btn-primary">
                    Criar produto
                    <Plus></Plus>
                </button>
            </div>
        </div>
      </main>
    </div>
  );
}