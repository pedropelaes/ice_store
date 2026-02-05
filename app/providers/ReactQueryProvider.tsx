"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  // O QueryClient deve ser criado dentro do componente para evitar compartilhar estado
  // entre requisições diferentes no servidor (Server Side Rendering).
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Por padrão, considera os dados "velhos" em 2 minutos. 
        // Se voltar para a tela antes disso, não busca de novo à toa.
        staleTime: 120 * 1000, 
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}