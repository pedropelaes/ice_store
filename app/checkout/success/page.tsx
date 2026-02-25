import { Lock, Check } from "lucide-react";
import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>; 
}) {
  const resolvedParams = await searchParams;
  const orderId = resolvedParams.order;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="bg-[#999999] text-white py-4 px-8 relative flex items-center h-16">
        <div className="font-bold text-2xl text-black">
          <Link href="/catalog">(LOGO)</Link>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 font-bold text-2xl">
          <Lock size={24} /> Checkout
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
        
        {/* Ícone de Sucesso */}
        <div className="w-24 h-24 bg-[#12581D] rounded-full flex items-center justify-center mb-6">
          <Check size={56} strokeWidth={3} className="text-white" />
        </div>

        {/* Mensagens */}
        <h1 className="text-xl md:text-2xl font-bold text-center mb-2 max-w-md">
          Seu pedido foi realizado! Obrigado por comprar em nossa loja!
        </h1>
        
        <p className="text-center font-bold text-sm md:text-base mb-8 max-w-md">
          Um recibo foi gerado e enviado para seu e-mail, você pode baixa-lo clicando{" "}
          <a 
            href={`/api/receipt?order=${orderId}`} 
            className="text-[#32CD32] hover:text-[#228B22] underline transition-colors"
          >
            aqui
          </a>
        </p>

        {/* Botão de Ação */}
        <Link 
          href="/orders" 
          className="bg-black text-white font-bold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          Visualize seus pedidos <span className="text-lg leading-none mb-1">›</span>
        </Link>
      </main>
    </div>
  );
}