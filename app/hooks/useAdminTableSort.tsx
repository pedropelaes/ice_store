"use client"

import { useState } from "react";
import { useDebounce } from "@/app/hooks/useDebounce"; 
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortOrder = "asc" | "desc";

interface UseAdminTableProps {
    initialSortField?: string;
    initialSortOrder?: SortOrder;
}

export function useAdminTable({ 
    initialSortField = "created_at", 
    initialSortOrder = "desc" 
}: UseAdminTableProps = {}) {
    
    // 1. Estados
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ field: initialSortField, order: initialSortOrder });
    
    // 2. Derivados
    const debouncedSearch = useDebounce(search, 500);

    // 3. Handlers Inteligentes
    
    // Ao buscar, reseta a página para 1 automaticamente
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1); 
    };

    const handleSort = (field: string) => {
        setSortConfig((current) => {
            if (current.field === field) {
                return {
                    field,
                    order: current.order === "asc" ? "desc" : "asc",
                };
            }
            return { field, order: "asc" };
        });
    };

    // 4. Render Helper (Visual)
    const renderSortIcon = (field: string) => {
        if (sortConfig.field !== field) {
            return <ArrowUpDown size={14} className="text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity" />;
        }
        if (sortConfig.order === "asc") return <ArrowUp size={14} className="text-black" />;
        return <ArrowDown size={14} className="text-black" />;
    };

    return {
        // State
        search,
        debouncedSearch,
        page,
        sortConfig,
        
        // Setters
        setSearch: handleSearchChange, // Usa nossa versão inteligente
        setPage,
        handleSort,
        
        // UI Helpers
        renderSortIcon
    };
}