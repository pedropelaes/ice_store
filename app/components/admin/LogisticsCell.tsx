"use client"

import { useState, useEffect, useRef } from "react";
import { Box, Check, X } from "lucide-react";

interface LogisticsValues {
    weight: number;
    length: number;
    width: number;
    height: number;
}

interface LogisticsCellProps {
    value: LogisticsValues;
    isModified?: boolean;
    onSave: (newValues: LogisticsValues) => void;
}

export function LogisticsCell({ value, isModified, onSave }: LogisticsCellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const [draft, setDraft] = useState({
        weight: value.weight === 0 ? '' : value.weight.toString(),
        length: value.length === 0 ? '' : value.length.toString(),
        width: value.width === 0 ? '' : value.width.toString(),
        height: value.height === 0 ? '' : value.height.toString(),
    });

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);


    const handleSave = () => {
        const cleanDraft = {
            weight: Number(draft.weight) || 0,
            length: Number(draft.length) || 0,
            width: Number(draft.width) || 0,
            height: Number(draft.height) || 0,
        };
        onSave(cleanDraft);
        setIsOpen(false);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        setIsOpen(false);
        // Opcional: O rascunho será refeito no próximo clique de abrir, então nem precisamos resetar aqui
    };

    const hasValues = value.weight > 0 && value.length > 0;

    return (
        <div className="relative" ref={dropdownRef}>
            <div 
                onClick={() => {
                    setDraft({
                        weight: value.weight === 0 ? '' : value.weight.toString(),
                        length: value.length === 0 ? '' : value.length.toString(),
                        width: value.width === 0 ? '' : value.width.toString(),
                        height: value.height === 0 ? '' : value.height.toString(),
                    });
                    setIsOpen(true);
                }}
                className={`flex items-center gap-2 px-2 py-1 -ml-2 rounded cursor-pointer border border-transparent hover:border-gray-200 hover:bg-white transition-colors
                    ${isModified ? 'bg-yellow-50 border-yellow-200 text-yellow-900' : ''}
                `}
            >
                <Box size={14} className="text-gray-400" />
                {hasValues ? (
                    <span className="text-xs whitespace-nowrap">
                        {value.weight}kg • {value.length}x{value.width}x{value.height}cm
                    </span>
                ) : (
                    <span className="text-xs text-gray-400 italic">Definir medidas</span>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-50 w-64">
                    <h4 className="text-sm font-bold mb-3 text-gray-800 border-b pb-2">Logística</h4>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4 text-black">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Peso (kg)</label>
                            <input 
                                type="number" step="0.01" min="0"
                                value={draft.weight} 
                                onChange={(e) => setDraft({...draft, weight: e.target.value})}
                                className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-black"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Comp. (cm)</label>
                            <input 
                                type="number" min="0"
                                value={draft.length} 
                                onChange={(e) => setDraft({...draft, length: e.target.value})}
                                className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-black"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Largura (cm)</label>
                            <input 
                                type="number" min="0"
                                value={draft.width} 
                                onChange={(e) => setDraft({...draft, width: e.target.value})}
                                className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-black"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Altura (cm)</label>
                            <input 
                                type="number" min="0"
                                value={draft.height} 
                                onChange={(e) => setDraft({...draft, height: e.target.value})}
                                className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-black"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button onClick={handleCancel} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                            <X size={16} />
                        </button>
                        <button onClick={handleSave} className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded">
                            <Check size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}