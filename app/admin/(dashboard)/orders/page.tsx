
export default async function ProductsPage() {
    
    return (
        <div className="w-full bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-black">Lista de pedidos</h1>
                
                <div className="flex gap-3">
                    <button className="btn-primary">
                        Teste
                    </button>
                </div>
                
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center bg-[#D9D9D9] p-2 rounded-lg mb-6 gap-4">
                {/* Lado Esquerdo: Input de Pesquisa */}
                <div className="w-full md:w-auto">
                {/* Input de busca aqui */}
                </div>

                {/* Lado Direito: Filtros (Data, Status, Categoria) */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                {/* Dropdowns aqui */}
                </div>
            </div>
        </div>
    )
}