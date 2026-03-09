"use client"

import { Copy, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PixQRCodeDisplayProps {
  qrCodeBase64?: string;
  qrCodeText?: string;
}

export function PixQRCodeDisplay({ qrCodeBase64, qrCodeText = "xxxxxxxxxxxxxxxxxxxxxxxxx" }: PixQRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (qrCodeText) {
      navigator.clipboard.writeText(qrCodeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start text-black">
      <div className="relative w-40 h-40 bg-gray-400 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
        {qrCodeBase64 ? (
          <Image
            src={`data:image/jpeg;base64,${qrCodeBase64}`}
            alt="QR Code PIX"
            fill
            className="object-cover"
          />
        ) : (
          <div className="grid grid-cols-2 gap-1 p-4 w-full h-full">
            <div className="bg-black rounded-sm w-full h-full"></div>
            <div className="bg-black rounded-sm w-full h-full"></div>
            <div className="bg-black rounded-sm w-full h-full"></div>
            <div className="bg-black rounded-sm w-full h-full justify-self-end self-end"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center pt-2">
        <h3 className="font-bold text-lg mb-2">Escaneie o código ou<br />copie a chave pix:</h3>
        
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm font-medium truncate max-w-50 md:max-w-75">
            {qrCodeText}
          </p>
          <button 
            onClick={handleCopy} 
            className="text-gray-500 hover:text-black transition-colors"
            title="Copiar código PIX"
          >
            {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} />}
          </button>
        </div>
        {copied && <span className="text-xs text-green-600 font-bold mt-1">Copiado!</span>}
      </div>
    </div>
  );
}