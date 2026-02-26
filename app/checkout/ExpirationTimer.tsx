"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ExpirationTimerProps {
  orderedAt: Date | null; 
}

export function ExpirationTimer({ orderedAt }: ExpirationTimerProps) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>("15:00");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const startTime = orderedAt? new Date(orderedAt).getTime() : new Date().getTime();
    
    const expireTime = startTime + 15 * 60 * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expireTime - now;

      if (distance <= 0) {
        clearInterval(interval);
        setTimeLeft("00:00");
        setIsExpired(true);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(
          `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [orderedAt]);

  if (isExpired) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-center">
        <p className="font-bold text-lg mb-2">Tempo expirado!</p>
        <p className="text-sm mb-4">O pedido foi cancelado.</p>
        <button 
          onClick={() => router.push('/cart')}
          className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 transition"
        >
          Voltar ao Carrinho
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-md text-center max-w-sm mx-auto">
      <p className="text-gray-600 text-sm mb-1">Pague em até</p>
      <div className="text-3xl font-bold text-[#12581D]">
        {timeLeft}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Após esse tempo, o pedido será cancelado automaticamente.
      </p>
    </div>
  );
}