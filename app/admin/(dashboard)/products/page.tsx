"use client"

import { FileInput, Plus, CircleDashed, Tag, ChevronDown, X, ChevronLeft, ChevronRight, Save} from "lucide-react";
import { CategoryOption } from "../../add-product/page";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { EditableCell } from "@/app/components/admin/EditableCell";
import { AdminPageHeader } from "@/app/components/admin/AdminPageHeader";
import { AdminToolbar } from "@/app/components/admin/AdminToolBar";
import { DateFilter } from "@/app/components/admin/DateFilter";
import { useAdminTable } from "@/app/hooks/useAdminTableSort";
import { useClickOutside } from "@/app/hooks/useClickOutside";
import { StockCell } from "@/app/components/admin/StockCell";
import { Size } from "@/app/generated/prisma";
import { LogisticsCell } from "@/app/components/admin/LogisticsCell";

export interface ProductItem{
    id?: string;
    size: string;
    quantity: number;
}
export const SIZES = Object.values(Size);

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    discount_price: number;
    items: ProductItem[];
    weight: number;
    length: number;
    width: number;
    height: number;
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
    const queryClient = useQueryClient();

    const table = useAdminTable({ initialSortField: "created_at" });

    const statusDropdown = useClickOutside<HTMLDivElement>();
    const categoryDropdown = useClickOutside<HTMLDivElement>();

    const [filterCategory, setFilterCategory] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDate, setFilterDate] = useState("");


    const [pendingUpdates, setPendingUpdates] = useState<Record<number, Partial<Product>>>({});
    const hasChanges = Object.keys(pendingUpdates).length > 0;

    // products query
    const { data: products, isLoading: isLoadingProducts, isError: isErrorProducts } = useQuery({
        queryKey: ['products', table.debouncedSearch, table.sortConfig, filterCategory, filterStatus, filterDate],
        queryFn: () => getProducts(table.search, table.sortConfig.field, table.sortConfig.order, filterCategory, filterStatus, filterDate, table.page),
    });

    // categories query
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories
    });
    
    const areArraysEqual = (arr1: any[], arr2: any[]) => {
        if (!Array.isArray(arr1) || !Array.isArray(arr2)) return arr1 === arr2;
        if (arr1.length !== arr2.length) return false;

        // Se forem objetos complexos (como ProductItem)
        if (typeof arr1[0] === 'object') {
            return JSON.stringify(arr1.sort((a,b) => a.size.localeCompare(b.size))) === 
                JSON.stringify(arr2.sort((a,b) => a.size.localeCompare(b.size)));
        }

        // Array simples
        const sorted1 = [...arr1].sort();
        const sorted2 = [...arr2].sort();
        return sorted1.every((value, index) => value === sorted2[index]);
    };

    const handleUpdateProduct = (id: number, field: keyof Product, newValue: any) => {
        setPendingUpdates((prev) => {
            const productUpdates = prev[id] || {};
            const originalProduct = products?.data?.find((p: any) => p.id === id);

            if (!originalProduct) return prev;

            let originalValue: any = originalProduct[field];

            // Tratamento especial para Categoria: Queremos sempre trabalhar com ARRAY DE IDs
            if (field === 'category') {
                if (Array.isArray(originalProduct.category)) {
                    originalValue = originalProduct.category.map((c: any) => c.id);
                } else if (originalProduct.category && typeof originalProduct.category === 'object') {
                    originalValue = [originalProduct.category.id];
                } else {
                    originalValue = [];
                }
            }

            // Verifica se mudou usando a comparação de arrays ou comparação simples
            const hasChanged = Array.isArray(newValue) 
                ? !areArraysEqual(originalValue, newValue)
                : String(originalValue) !== String(newValue);

            // Se for igual ao original, removemos do estado de pending (Undo)
            if (!hasChanged) {
                const { [field]: _, ...restFields } = productUpdates;
                if (Object.keys(restFields).length === 0) {
                    const { [id]: __, ...restProducts } = prev;
                    return restProducts;
                }
                return { ...prev, [id]: restFields };
            }

            // Se mudou, atualiza
            return {
                ...prev,
                [id]: { ...productUpdates, [field]: newValue }
            };
        });
    };

    const { mutate: saveChanges, isPending: isSaving } = useMutation({
        mutationFn: async (updates: Record<number, Partial<Product>>) => {
            // Aqui fazemos o fetch simples, mas encapsulado
            const res = await fetch("/api/products/edit-products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!res.ok) throw new Error("Falha ao atualizar produtos");
            return res.json();
        },
        onSuccess: () => {
            // 1. Limpa as edições pendentes (remove o amarelo)
            setPendingUpdates({});
            
            // 2. Avisa o React Query que os dados de 'products' estão velhos
            // Isso força um refetch automático da tabela com os dados novos do banco
            queryClient.invalidateQueries({ queryKey: ['products'] });
            
            // Opcional: Adicionar um Toast de sucesso aqui
            alert("Alterações salvas com sucesso!");
        },
        onError: (error) => {
            console.error(error);
            alert("Erro ao salvar alterações. Tente novamente.");
        }
    });

    const handleSaveChanges = () => {
        if (!hasChanges) return;
        saveChanges(pendingUpdates);
    };

    

    const totalItems = products?.meta?.total || 0;
    const itemsPerPage = products?.meta?.limit || 20;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div className="w-full">
            
            <AdminPageHeader title="Lista de produtos">
                <button className="btn-tertiary">
                    <FileInput size={16}/> Exportar
                </button>
                <Link 
                    href="/admin/add-product"  
                    className="btn-secondary bg-[#12581D] text-white hover:bg-[#0C3C14] flex items-center gap-2" 
                >
                    <Plus size={16}/> Adicionar produto
                </Link>
            </AdminPageHeader>
                
            
            <div className="w-full bg-[#D9D9D9] rounded-xl shadow-sm p-6" >
                <AdminToolbar searchValue={table.search} onSearchChange={(val) => { table.setSearch(val); table.setPage(1); }}>
                    
                    <button
                        onClick={(e) => { e.stopPropagation(); handleSaveChanges(); }}
                        disabled={!hasChanges || isSaving}
                        className={`
                            flex items-center gap-2 px-4 h-10 rounded-lg font-medium transition-all shadow-sm
                            ${hasChanges 
                                ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500 hover:shadow-md cursor-pointer translate-y-0" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                            }
                        `}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{isSaving ? "Salvando..." : `Salvar ${hasChanges ? `(${Object.keys(pendingUpdates).length})` : ""}`}</span>
                    </button>
                    
                    {hasChanges && !isSaving && (
                        <button onClick={() => setPendingUpdates({})} className="text-[#900A00] hover:bg-red-50 p-2 rounded-full" title="Descartar">
                            <X size={20}/>
                        </button>
                    )}

                    <div className="w-px h-8 bg-gray-300 mx-1 hidden md:block"></div>

                    <DateFilter date={filterDate} setDate={(val) => { setFilterDate(val); table.setPage(1); }} />
                    
                     <div className="relative" ref={statusDropdown.ref}>
                        <button 
                            className={`flex items-center gap-2 bg-white px-3 h-10 rounded-lg text-sm font-medium text-black shadow-sm border hover:bg-gray-50 ${filterStatus ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            onClick={() => statusDropdown.setIsOpen(!statusDropdown.isOpen)}
                        >
                            <CircleDashed size={16} />
                            <span>{filterStatus ? STATUS_MAP[filterStatus]?.label : "Status"}</span>
                            {filterStatus ? <div onClick={(e) => { e.stopPropagation(); setFilterStatus(""); table.setPage(1);}}><X size={14} /></div> : <ChevronDown size={14} />}
                        </button>
                        {statusDropdown.isOpen && (
                            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[150px] overflow-hidden text-black">
                                {Object.keys(STATUS_MAP).map((key) => (
                                    <div key={key} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2" onClick={() => { setFilterStatus(key); statusDropdown.setIsOpen(false); table.setPage(1);}}>
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_MAP[key].bg}}></div>
                                        {STATUS_MAP[key].label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={categoryDropdown.ref}>
                        <button 
                            className={`flex items-center gap-2 bg-white px-3 h-10 rounded-lg text-sm font-medium text-black shadow-sm border hover:bg-gray-50 ${filterCategory ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                            onClick={() => categoryDropdown.setIsOpen(!categoryDropdown.isOpen)}
                        >
                            <Tag size={16} />
                            <span>{filterCategory || "Categoria"}</span>
                            {filterCategory ? <div onClick={(e) => { e.stopPropagation(); setFilterCategory(""); }}><X size={14} /></div> : <ChevronDown size={14} />}
                        </button>
                        {categoryDropdown.isOpen && (
                            <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[180px] max-h-60 overflow-y-auto text-black">
                                {categories?.map((cat: CategoryOption) => (
                                    <div key={cat.id} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => { setFilterCategory(cat.name); categoryDropdown.setIsOpen(false); }}>
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </AdminToolbar>

            <div className="overflow-x-auto pb-40 min-h-[400px]">
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
                                    onClick={() => table.handleSort("name")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Nome do produto
                                        {table.renderSortIcon("name")}
                                    </div>
                                </th>
                                <th className="table-clickable-header group"
                                    onClick={() => table.handleSort("category")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Categoria
                                        {table.renderSortIcon("category")}
                                    </div>
                                </th>
                                <th className= "table-clickable-header group"
                                    onClick={() => table.handleSort("price")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Preço
                                        {table.renderSortIcon("price")}
                                    </div>
                                </th>
                                <th className="table-clickable-header group"
                                    onClick={() => table.handleSort("discount_price")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Preço de Desconto
                                        {table.renderSortIcon("discount_price")}
                                    </div>
                                </th>
                                <th className="table-clickable-header group"
                                    onClick={() => table.handleSort("quantity")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Estoque
                                        {table.renderSortIcon("quantity")}
                                    </div>
                                </th>
                                <th className="table-clickable-header group"
                                    onClick={() => table.handleSort("logistics")}    
                                >
                                    Logística
                                    {table.renderSortIcon("logistics")}
                                </th>
                                <th className="table-clickable-header group" onClick={() => table.handleSort("created_at")}>
                                    <div className="flex items-center gap-2">Criado em {table.renderSortIcon("created_at")}</div>
                                </th>
                                <th className="table-clickable-header group"
                                    onClick={() => table.handleSort("created_by")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Criado por
                                        {table.renderSortIcon("created_by")}
                                    </div>
                                </th>
                                <th className="table-clickable-header group"
                                    onClick={() => table.handleSort("active")}
                                >
                                    <div className="flex items-center gap-2 ">
                                        Status
                                        {table.renderSortIcon("active")}
                                    </div>
                                </th>
                                <th className="table-clickable-header group" onClick={() => table.handleSort("description")}>
                                    <div className="flex items-center gap-2 ">
                                        Descrição
                                        {table.renderSortIcon("description")}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="text-black text-sm">
                            {products?.data?.map((prod: any) => {
                                const pendingData = pendingUpdates[prod.id] || {};

                                const getValue = (field: keyof Product) => {
                                    return pendingData[field] !== undefined ? pendingData[field] : prod[field];
                                };

                                const isDirty = (field: keyof Product) => pendingData[field] !== undefined;
                                return (
                                <tr key={prod.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 flex items-center gap-3">
                                        {/* Imagem Placeholder ou Real */}
                                        <div className="w-10 h-10 bg-gray-200 rounded-md overflow-hidden">
                                            {prod.image_url && <img src={prod.image_url} alt="" className="w-full h-full object-cover"/>}
                                        </div>
                                        <div className="w-full">
                                            <EditableCell
                                                value={getValue('name')}
                                                isModified={isDirty('name')}
                                                onSave={(val) => handleUpdateProduct(prod.id, 'name', val)}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <EditableCell 
                                            // Lógica de VALOR: Sempre passamos um array de IDs para o componente editar
                                            value={
                                                isDirty('category') 
                                                ? pendingData.category // Se tiver edição pendente, usa ela (já é array de IDs)
                                                : Array.isArray(prod.category) // Se não, pega do banco e transforma em array de IDs
                                                    ? prod.category.map((c: any) => c.id) 
                                                    : prod.category?.id ? [prod.category.id] : []
                                            }
                                            type="multi-select" // Novo tipo
                                            isModified={isDirty('category')}
                                            options={categories?.map((c: any) => ({ label: c.name, value: c.id })) || []}
                                            // Renderização visual quando NÃO está editando
                                            renderValue={(valIds) => {
                                                if (!Array.isArray(valIds) || valIds.length === 0) return <span className="text-gray-400 italic">Sem categoria</span>;
                                                
                                                return (
                                                    <div className="flex flex-wrap gap-1">
                                                        {valIds.map((val, idx) => {
                                                            // Lógica mista:
                                                            // Se 'val' for número, procuramos o nome na lista de categorias.
                                                            // Se 'val' for string, significa que é uma NOVA categoria criada pelo usuário, então mostramos a string direta.
                                                            
                                                            let name;
                                                            if (typeof val === 'number' || !isNaN(Number(val))) {
                                                                const cat = categories?.find((c: any) => c.id === Number(val));
                                                                name = cat ? cat.name : null;
                                                            } else {
                                                                name = val; // É uma nova categoria (String)
                                                            }

                                                            if (!name) return null;

                                                            return (
                                                                <span key={idx} className={`px-2 py-0.5 rounded text-xs border ${typeof val === 'string' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                                    {name} {typeof val === 'string' && '*'} {/* Asterisco indicando novo */}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                );
                                            }}
                                            
                                            onSave={(val) => handleUpdateProduct(prod.id, 'category', val)} 
                                        />
                                    </td>
                                    <td className="p-3">
                                        <EditableCell 
                                            value={getValue('price')} 
                                            isModified={isDirty('price')} 
                                            type="number"
                                            renderValue={(val) => `R$ ${Number(val).toFixed(2)}`}
                                            onSave={(val) => handleUpdateProduct(prod.id, 'price', Number(val))} 
                                        />
                                    </td>
                                    <td className="p-3">
                                        <EditableCell 
                                            value={getValue('discount_price')} 
                                            isModified={isDirty('discount_price')} 
                                            type="number"
                                            renderValue={(val) => `R$ ${Number(val).toFixed(2)}`}
                                            onSave={(val) => handleUpdateProduct(prod.id, 'discount_price', Number(val))} 
                                        />
                                    </td>
                                    <td className="p-3">
                                        <StockCell 
                                            value={
                                                (isDirty('items') ? pendingData.items : prod.items) || []
                                            }
                                            
                                            isModified={isDirty('items')}
                                            
                                            onSave={(newItems) => handleUpdateProduct(prod.id, 'items', newItems)}
                                        />
                                    </td>
                                    <td className="p-3">
                                        <LogisticsCell
                                            value={{
                                                weight: Number(getValue('weight')) || 0,
                                                length: Number(getValue('length')) || 0,
                                                width: Number(getValue('width')) || 0,
                                                height: Number(getValue('height')) || 0,
                                            }}

                                            isModified={
                                                isDirty('weight') || 
                                                isDirty('length') || 
                                                isDirty('width') || 
                                                isDirty('height')
                                            }
                                            
                                            onSave={(newValues) => {
                                                handleUpdateProduct(prod.id, 'weight', newValues.weight);
                                                handleUpdateProduct(prod.id, 'length', newValues.length);
                                                handleUpdateProduct(prod.id, 'width', newValues.width);
                                                handleUpdateProduct(prod.id, 'height', newValues.height);
                                            }}
                                        />
                                    </td>
                                    <td className="p-3">
                                            {new Date(prod.created_at).toLocaleDateString('pt-BR')} 
                                            <span className="text-gray-500 text-xs block">
                                                {new Date(prod.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </td>
                                    <td className="p-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{prod.admin.name}</span>
                                            <span className="text-xs text-gray-500" >{prod.admin.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <EditableCell 
                                            value={getValue('active')}
                                            isModified={isDirty('active')}
                                            type="select"
                                            options={Object.keys(STATUS_MAP).map(k => ({ label: STATUS_MAP[k].label, value: k }))}
                                            renderValue={(val) => {
                                                const conf = STATUS_MAP[val] || { bg: '#eee', text: '#000', label: val };
                                                return (
                                                    <span className="px-2 py-1 rounded text-xs font-bold inline-block"
                                                        style={{ backgroundColor: conf.bg, color: conf.text }}
                                                    >
                                                        {conf.label}
                                                    </span>
                                                )
                                            }}
                                            onSave={(val) => handleUpdateProduct(prod.id, 'active', val)} 
                                        />
                                    </td>
                                    <td className="p-3 max-w-xs">
                                        <EditableCell 
                                            value={getValue('description')} 
                                            isModified={isDirty('description')}
                                            type="textarea"
                                            className="truncate"
                                            onSave={(val) => handleUpdateProduct(prod.id, 'description', val)} 
                                        />
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
                        Mostrando página <strong>{table.page}</strong> de <strong>{totalPages || 1}</strong> 
                        <span className="ml-2">({totalItems} produtos)</span>
                    </span>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => table.setPage(old => Math.max(old - 1, 1))}
                            disabled={table.page === 1}
                            className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <button 
                            onClick={() => table.setPage(old => (old < totalPages ? old + 1 : old))}
                            disabled={table.page >= totalPages}
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