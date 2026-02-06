"use client"

import { FileInput, Plus, Search, Calendar, CircleDashed, Tag, ChevronDown, Circle, ArrowUpDown, ArrowUp, ArrowDown, X, ChevronLeft, ChevronRight} from "lucide-react";
import { CategoryOption } from "../../add-product/page";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useDebounce } from "@/app/hooks/useDebounce";

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


async function getProducts(search: string, sort: string, order: string, category: string, status: string, date: string, page: number) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if(category) params.append("category", category);
    if(status) params.append("status", status);
    if(date) params.append("date", date);

    params.append("sort", sort);
    params.append("order", order);

    params.append("page", page.toString());
    params.append("limit", "20");

    const url = `/api/products/get-all?${params.toString()}`;
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
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [sortConfig, setSortConfig] = useState({ field: "created_at", order: "desc" });
    const debouncedSearch = useDebounce(search, 500);

    const [filterCategory, setFilterCategory] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [page, setPage] = useState(1);

    const [activeDropdown, setActiveDropdown] = useState<null | 'status' | 'category'>(null);

    // products query
    const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts } = useQuery({
        queryKey: ['products', debouncedSearch, sortConfig, filterCategory, filterStatus, filterDate], // search change = fetch again
        queryFn: () => getProducts(search, sortConfig.field, sortConfig.order, filterCategory, filterStatus, filterDate, page),
    });

    // categories query
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    });

    const handleSort = (field: string) => {
        setSortConfig((current) => {
            if(current.field === field){
                return{
                    field,
                    order: current.order === "asc" ? "desc" : "asc"
                };
            }
            return {field, order: "asc"}
        })
    }

    const renderSortIcon = (field: string) => {
        if(sortConfig.field !== field){
            return <ArrowUpDown size={14} className="text-gray-400 opacity-50 group-hover:opacity-100" />;
        }
        if (sortConfig.order === "asc") return <ArrowUp size={14} className="text-black" />;
        return <ArrowDown size={14} className="text-black" />;
    }

    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const dateInputRef = useRef<HTMLInputElement>(null);

    const totalItems = products?.meta?.total || 0;
    const itemsPerPage = products?.meta?.limit || 20;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div>
            <div className="flex justify-between items-center mb-6" onClick={() => setActiveDropdown(null)}>
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
            <div className="w-full bg-[#D9D9D9] rounded-xl shadow-sm p-6" >
                <div className="flex flex-col md:flex-row justify-between items-center p-2 rounded-lg mb-6 gap-4">
                
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black"></Search>
                    <input type="search" className="input-custom pl-10 placeholder-black/70" placeholder="Pesquisar"
                    value={search} onChange={(e) => {setSearch(e.target.value); setPage(1);}}
                    ></input>
                </div>

                <div className="flex gap-2 w-full md:w-auto flex-wrap no-scrollbar">

                    <div className="relative bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {dateInputRef.current?.showPicker()}}
                    >
                        <div className={`flex items-center gap-2 pl-3 py-2 text-sm font-medium text-gray-700 ${filterDate ? 'text-black pr-8' : 'pr-3'}`}>
                            <Calendar size={16} />
                            <span>
                                {filterDate 
                                    // Adicionei 'UTC' aqui para garantir que o front mostre a mesma data que enviou pro back
                                    ? new Date(filterDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) 
                                    : "Selecione uma data"}
                            </span>
                        </div>

                        <input 
                            ref={dateInputRef}
                            type="date" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            value={filterDate}
                            onChange={(e) => {setFilterDate(e.target.value); setPage(1)}}
                        />

                        {filterDate && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setFilterDate(""); }} 
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-700 z-20 bg-white rounded-full p-0.5"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <button 
                            className={`flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-sm font-medium text-black shadow-sm border hover:bg-gray-50 ${filterStatus ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                        >
                            <CircleDashed size={16} />
                            <span>{filterStatus ? STATUS_MAP[filterStatus]?.label : "Status"}</span>
                            {filterStatus ? (
                                <div onClick={(e) => { e.stopPropagation(); setFilterStatus(""); setPage(1);}} className="hover:text-red-500"><X size={14} /></div>
                            ) : (
                                <ChevronDown size={14} className="text-black" />
                            )}
                        </button>

                        {activeDropdown === 'status' && (
                            <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[150px] overflow-hidden text-black">
                                {Object.keys(STATUS_MAP).map((key) => (
                                    <div 
                                        key={key}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
                                        onClick={() => { setFilterStatus(key); setActiveDropdown(null); setPage(1);}}
                                    >
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_MAP[key].bg}}></div>
                                        {STATUS_MAP[key].label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button 
                            className={`flex items-center gap-2 bg-white px-3 py-2 rounded-lg text-sm font-medium text-black shadow-sm border hover:bg-gray-50 ${filterCategory ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                        >
                            <Tag size={16} />
                            <span>{filterCategory || "Categoria"}</span>
                            {filterCategory ? (
                                <div onClick={(e) => { e.stopPropagation(); setFilterCategory(""); }} className="hover:text-red-500 "><X size={14} /></div>
                            ) : (
                                <ChevronDown size={14} className="text-black" />
                            )}
                        </button>

                        {activeDropdown === 'category' && (
                            <div className="absolute top-full mt-2 right-0 md:left-0 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[180px] max-h-60 overflow-y-auto text-black">
                                {categories?.map((cat: CategoryOption) => (
                                    <div 
                                        key={cat.id}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        onClick={() => { setFilterCategory(cat.name); setActiveDropdown(null); }}
                                    >
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
                                <th className="table-clickable-header group"
                                    onClick={() => handleSort("name")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Nome do produto
                                        {renderSortIcon("name")}
                                    </div>
                                </th>
                                <th className="table-clickable-header group"
                                    onClick={() => handleSort("category")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Categoria
                                        {renderSortIcon("category")}
                                    </div>
                                </th>
                                <th className= "table-clickable-header group"
                                    onClick={() => handleSort("price")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Preço
                                        {renderSortIcon("price")}
                                    </div>
                                </th>
                                <th className="table-clickable-header group"
                                    onClick={() => handleSort("quantity")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Estoque
                                        {renderSortIcon("quantity")}
                                    </div>
                                </th>
                                <th className="table-clickable-header group" onClick={() => handleSort("created_at")}>
                                    <div className="flex items-center gap-2">Criado em {renderSortIcon("created_at")}</div>
                                </th>
                                <th className="table-clickable-header group"
                                    onClick={() => handleSort("created_by")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Criado por
                                        {renderSortIcon("created_by")}
                                    </div>
                                </th>
                                <th className="table-clickable-header group"
                                    onClick={() => handleSort("active")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Status
                                        {renderSortIcon("active")}
                                    </div>
                                </th>
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
                                    <td className="p-3">
                                            {new Date(prod.created_at).toLocaleDateString('pt-BR')} 
                                            <span className="text-gray-400 text-xs block">
                                                {new Date(prod.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </td>
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

                {!isLoadingProducts && !isErrorProducts && (
                 <div className="flex items-center justify-between mt-4 border-t border-gray-300 pt-4">
                    <span className="text-sm text-gray-500">
                        Mostrando página <strong>{page}</strong> de <strong>{totalPages || 1}</strong> 
                        <span className="ml-2">({totalItems} produtos)</span>
                    </span>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage(old => Math.max(old - 1, 1))}
                            disabled={page === 1}
                            className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <button 
                            onClick={() => setPage(old => (old < totalPages ? old + 1 : old))}
                            disabled={page >= totalPages}
                            className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                 </div>
             )}
                
            </div>
        </div>
    )
}