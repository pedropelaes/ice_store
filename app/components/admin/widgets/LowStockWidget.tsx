import { AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { LowStockProduct } from "@/app/services/dashboard-service";

interface LowStockWidgetProps {
    data: LowStockProduct[];
}

export function LowStockWidget({ data }: LowStockWidgetProps) {
    // Removemos o return null para sempre renderizar o container
    const hasLowStock = data && data.length > 0;

    return (
        <div className="bg-[#383838] rounded-lg shadow-md flex flex-col h-full min-h-[300px]">
            {/* Header do Card */}
            <div className="p-4 border-b border-[#525252] flex justify-between items-center">
                <div className="flex items-center gap-2">
                    {hasLowStock ? (
                        <AlertTriangle size={20} className="text-yellow-500" />
                    ) : (
                        <CheckCircle size={20} className="text-green-500" />
                    )}
                    <h3 className="font-semibold text-gray-200">Atenção ao Estoque</h3>
                </div>
                {hasLowStock && (
                    <span className="text-xs text-gray-400 bg-[#4a4a4a] px-2 py-1 rounded">
                        &lt; 5 unidades
                    </span>
                )}
            </div>

            {/* Conteúdo Dinâmico */}
            <div className="flex-1 overflow-auto p-2">
                {!hasLowStock ? (
                    // --- ESTADO VAZIO (ESTOQUE SAUDÁVEL) ---
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 opacity-70">
                        <CheckCircle size={48} className="text-green-600" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-300">Tudo certo por aqui!</p>
                            <p className="text-xs mt-1">Nenhum produto com estoque crítico.</p>
                        </div>
                    </div>
                ) : (
                    // --- LISTA DE PRODUTOS ---
                    <div className="flex flex-col gap-2">
                        {data.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-[#434343] rounded border border-[#525252] hover:bg-[#4a4a4a] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#2d2d2d] rounded overflow-hidden flex-shrink-0">
                                        {product.image_url && (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-80" />
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-200 truncate max-w-[120px] sm:max-w-[150px]" title={product.name}>
                                            {product.name}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                            Restante total: {product.totalStock}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-1 flex-wrap justify-end max-w-[140px]">
                                    {product.items.map((item, idx) => (
                                        <div 
                                            key={idx}
                                            className={`
                                                flex flex-col items-center justify-center px-1.5 py-0.5 rounded border text-[10px] font-bold min-w-[24px]
                                                ${item.quantity === 0 
                                                    ? 'bg-red-900/30 text-red-400 border-red-900' // Zerado
                                                    : 'bg-yellow-900/30 text-yellow-400 border-yellow-900' // Baixo
                                                }
                                            `}
                                        >
                                            <span>{item.size}</span>
                                            <span>{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer com Link */}
            <div className="p-3 border-t border-[#525252]">
                <Link 
                    href="/admin/products?sort=totalStock&order=asc" 
                    className="flex items-center justify-center text-xs text-blue-400 hover:text-blue-300 gap-1 transition-colors"
                >
                    Ver inventário completo <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );
}