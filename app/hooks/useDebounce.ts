import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Cria um timer para atualizar o valor
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Se o valor mudar antes do tempo (usuário digitou dnv), cancela o timer anterior
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}