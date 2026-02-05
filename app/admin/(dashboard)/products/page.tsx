"use client"

import { FileInput, Plus, Search, Calendar, CircleDashed, Tag, ChevronDown, Circle} from "lucide-react";
import { CategoryOption } from "../../add-product/page";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    quantity: number;
    category: CategoryOption;
    image_url: string;
    active: string;
    created_at: string;
    created_by: { name: string, email: string };
}


async function getProducts(filters?: string) {
    const url = `/api/products/get-all${filters ? `?${filters}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar produtos");
    return res.json();
}

async function getCategories() {
    const res = await fetch("/api/products/categories/get-all");
    if (!res.ok) throw new Error("Erro ao buscar categorias");
    return res.json();
}

type ProductStatus = "PENDING" | "ACTIVE" | "DEACTIVATED";

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
    PENDING: {
        label: "Pendente",
        bg: "#FFBF00",
        text: "#584200" 
    },
    ACTIVE: {
        label: "Ativo",
        bg: "#82FF95",
        text: "#00410A" 
    },
    DEACTIVATED: {
        label: "Desativado",
        bg: "#5B5B5B",
        text: "#DFDFDF" 
    }
};

export default function ProductsPage() {
    const todayDate = new Date();
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    

    // products query
    const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts } = useQuery({
        queryKey: ['products', search], // search change = fetch again
        queryFn: () => getProducts(search ? `search=${search}` : ''),
    });

    // categories query
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    });
    
    return (
        <div>
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
            <div className="w-full bg-[#D9D9D9] rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-center p-2 rounded-lg mb-6 gap-4">
                
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black"></Search>
                    <input type="search" className="input-custom pl-10 placeholder-black/70" placeholder="Pesquisar"
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    ></input>
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

            <div className="overflow-x-auto">
                {isLoadingProducts ? (
                    <div className="flex justify-center p-10">
                        <Loader2 className="animate-spin text-gray-500" size={32} />
                    </div>
                ) : isErrorProducts ? (
                    <div className="text-red-500 text-center p-10">Erro ao carregar produtos.</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-black text-sm border-b border-gray-200 bg-white">
                                <th className="p-3 font-medium">Nome do produto</th>
                                <th className="p-3 font-medium">Categoria</th>
                                <th className="p-3 font-medium">Preço</th>
                                <th className="p-3 font-medium">Estoque</th>
                                <th className="p-3 font-medium">Criado por</th>
                                <th className="p-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-black text-sm">
                            {products?.data?.map((prod: any) => {
                                const statusConfig = STATUS_MAP[prod.active] || {
                                    label: prod.active,
                                    bg: "#E5E7EB",      
                                    text: "#000000"
                                };
                                return (
                                <tr key={prod.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 flex items-center gap-3">
                                        {/* Imagem Placeholder ou Real */}
                                        <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
                                            {prod.image_url && <img src={prod.image_url} alt="" className="w-full h-full object-cover"/>}
                                        </div>
                                        {prod.name}
                                    </td>
                                    <td className="p-3">
                                        {/* Se for array de categorias, mapeamos. Se for objeto único, acessamos direto. */}
                                        {Array.isArray(prod.category) 
                                            ? prod.category.map((c: any) => c.name).join(", ") 
                                            : "N/A"}
                                    </td>
                                    <td className="p-3">R$ {Number(prod.price).toFixed(2)}</td>
                                    <td className="p-3">{prod.quantity}</td>
                                    <td className="p-3">{prod.admin?.name || "Admin"}</td>
                                    <td className="p-3">
                                        <span className="text-green-700 px-2 py-1 rounded text-xs font-bold"
                                        style={{
                                            backgroundColor: statusConfig.bg,
                                            color: statusConfig.text
                                        }}
                                        >
                                            {statusConfig.label}
                                        </span>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            </div>
        </div>
    )
}