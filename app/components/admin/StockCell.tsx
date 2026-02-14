import { ProductItem, SIZES } from "@/app/admin/(dashboard)/products/page";
import { useClickOutside } from "@/app/hooks/useClickOutside";
import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

export function StockCell({ 
    value, 
    onSave, 
    isModified 
}: { 
    value: ProductItem[], 
    onSave: (newItems: ProductItem[]) => void,
    isModified: boolean
}) {
    const dropdown = useClickOutside<HTMLDivElement>();

    const [draftValue, setDraftValue] = useState<ProductItem[]>([]);

    // Sincroniza o rascunho com o valor real SEMPRE que o dropdown abre
    useEffect(() => {
        if (dropdown.isOpen) {
            // Deep copy para evitar mutação por referência
            setDraftValue(JSON.parse(JSON.stringify(value)));
        }
    }, [dropdown.isOpen, value]);

    // Calcula o total apenas para exibir no resumo
    const totalQuantity = value.reduce((acc, item) => acc + item.quantity, 0);

    const handleConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSave(draftValue); 
        dropdown.setIsOpen(false);
    };

    const handleCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        dropdown.setIsOpen(false);
    };

    // Função para atualizar a quantidade de um tamanho específico
    const handleChangeSize = (size: string, newQty: string) => {
        const qty = parseInt(newQty) || 0;
        
        // Cria uma cópia do array atual
        let newItems = [...draftValue];
        
        // Caso 1: Usuário está tentando adicionar/editar "UNIC"
        if (size === "UNIC" && qty > 0) {
            newItems = newItems.filter(i => i.size === "UNIC");  // Removemos TODOS os outros tamanhos, deixando apenas o UNIC
            
            // Se já existia UNIC, atualizamos. Se não, criamos.
            const existingIndex = newItems.findIndex(i => i.size === "UNIC");
            if (existingIndex >= 0) {
                newItems[existingIndex] = { ...newItems[existingIndex], quantity: qty };
            } else {
                newItems.push({ size: "UNIC", quantity: qty });
            }
        } 
        
        // Caso 2: Usuário está tentando adicionar outro tamanho (P, M, G...)
        else if (size !== "UNIC") {
            if (qty > 0) {    // Se a quantidade for > 0, precisamos garantir que NÃO existe UNIC na lista
                const hasUnic = newItems.some(i => i.size === "UNIC" && i.quantity > 0);
                
                // Bloquear silenciosamente (não faz nada)
                // if (hasUnic) return; 

                //  Remover o UNIC automaticamente para permitir o novo tamanho
                if (hasUnic) {
                   newItems = newItems.filter(i => i.size !== "UNIC");
                }
            }

            // Lógica padrão de atualização
            const existingIndex = newItems.findIndex(i => i.size === size);
            if (existingIndex >= 0) {
                newItems[existingIndex] = { ...newItems[existingIndex], quantity: qty };
            } else {
                newItems.push({ size: size as any, quantity: qty });
            }
        }
        
        // Caso 3: Zerando o UNIC (apenas atualiza normal, pois 0 não conflita)
        else if (size === "UNIC" && qty === 0) {
             const existingIndex = newItems.findIndex(i => i.size === "UNIC");
             if (existingIndex >= 0) {
                newItems[existingIndex] = { ...newItems[existingIndex], quantity: 0 };
             }
        }
        
        setDraftValue(newItems);
    };

    return (
        <div className="relative h-full flex items-center" ref={dropdown.ref}>
            <div 
                onClick={() => dropdown.setIsOpen(!dropdown.isOpen)}
                className={`
                    cursor-pointer min-h-[40px] p-2 rounded-md w-full flex flex-wrap gap-1 items-center
                    border transition-all
                    ${dropdown.isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-transparent hover:bg-gray-100'}
                    ${isModified ? 'bg-yellow-50 border-yellow-200' : ''}
                `}
            >
                {value.length === 0 || totalQuantity === 0 ? (
                    <span className="text-red-400 text-xs font-medium">Sem estoque</span>
                ) : (
                    value.map((item) => item.quantity > 0 && (
                        <span key={item.size} className="bg-gray-100 text-gray-700 border border-gray-200 text-[12px] px-1.5 py-0.5 rounded font-medium">
                            {item.size}: {item.quantity}
                        </span>
                    ))
                )}
            </div>

            {dropdown.isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-3 min-w-[200px]">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase mb-1">Gerenciar Estoque</span>
                        
                        {SIZES.map((size) => {
                            const currentItem = draftValue.find(v => v.size === size);
                            const currentQty = currentItem?.quantity || 0;

                            const hasUnic = draftValue.some(v => v.size === "UNIC" && v.quantity > 0);
                            const hasOthers = draftValue.some(v => v.size !== "UNIC" && v.quantity > 0);
                            const isConflict = (size === "UNIC" && hasOthers) || (size !== "UNIC" && hasUnic);
                            return (
                                <div key={size} className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-medium w-8 text-gray-700">{size}</span>
                                    <input 
                                        type="number" 
                                        //disabled={isConflict}
                                        min={0}
                                        className={`
                                            w-full h-8 px-2 border rounded text-sm focus:outline-none focus:border-blue-500
                                            ${isConflict ? 'border-red-200 bg-red-50 text-red-400' : 'border-gray-300'}
                                        `}
                                        value={currentQty}
                                        onChange={(e) => handleChangeSize(size, e.target.value)}
                                        onClick={(e) => e.stopPropagation()} // Evita fechar ao clicar no input
                                    />
                                </div>
                            )
                        })}

                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                            <button
                                onClick={handleCancel}
                                className="flex-1 flex items-center justify-center gap-1 h-8 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                            >
                                <X size={14} /> Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="flex-1 flex items-center justify-center gap-1 h-8 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
                            >
                                <Check size={14} /> Aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}