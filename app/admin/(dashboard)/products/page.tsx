import { FileInput, Plus, Search, Calendar, CircleDashed, Tag, ChevronDown, Circle} from "lucide-react";
import Link from "next/link";

export default async function ProductsPage() {
    const todayDate = new Date();
    
    return (
        <div className="w-full bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-black">Lista de produtos</h1>
                
                <div className="flex gap-3">
                    <button className="btn-tertiary ">
                        <FileInput></FileInput>
                        Exportar
                    </button>
                    <Link 
                        href="/admin/add-product"  
                        className="btn-secondary bg-[#12581D] text-white hover:bg-[#0C3C14] flex items-center gap-2" 
                    >
                        <Plus/>
                        Adicionar produto
                    </Link>
                </div>
                
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center bg-[#D9D9D9] p-2 rounded-lg mb-6 gap-4">
                
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></Search>
                    <input type="search" className="input-custom pl-10" placeholder="Pesquisar"></input>
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                    <button className="flex items-center border-1 border-black gap-2 bg-white px-3 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 whitespace-nowrap">
                        <Calendar size={16} />
                        <span>{todayDate.toLocaleDateString()}</span>
                    </button>

                    <button className="flex items-center border-1 border-black gap-2 bg-white px-3 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 whitespace-nowrap">
                        <CircleDashed size={16} />
                        <span>Status</span>
                        <ChevronDown size={14} className="text-black" />
                    </button>

                    <button className="flex items-center border-1 border-black gap-2 bg-white px-3 py-2 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 whitespace-nowrap">
                        <Tag size={16} />
                        <span>Categoria</span>
                        <ChevronDown size={14} className="text-black" />
                    </button>
                </div>
            </div>
        </div>
    )
}