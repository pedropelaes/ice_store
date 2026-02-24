export const formatLettersOnly = (value: string) => {
      return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
}

export const formatNumbersOnly = (value: string) => {
    return value.replace(/\D/g, "");
};

export const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, ""); 

    return numbers
    .slice(0, 11) 
    .replace(/(\d{3})(\d)/, "$1.$2") 
    .replace(/(\d{3})(\d)/, "$1.$2") 
    .replace(/(\d{3})(\d{1,2})/, "$1-$2") 
    .replace(/(-\d{2})\d+?$/, "$1"); 
    };

export const formatEmail = (value: string) =>{
    return value.toLowerCase().replace(/\s/g, "");
}

export const capitalizeWords = (value: string) => {
    return value
    .split(' ') // 1. Vira lista: ['silva', 'da', 'costa']
    .map(word => {
        // 2. Capitaliza a primeira letra de cada item da lista
        return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' '); // 3. Junta tudo de volta com espaços
};

export const formatCurrency = (value: string) => {
  // 1. Remove tudo que não é dígito
  const onlyNumbers = value.replace(/\D/g, "");

  // 2. Converte para centavos (ex: 1999 -> 19.99)
  const amount = Number(onlyNumbers) / 100;

  // 3. Formata para o padrão BRL
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

// Valida se o número do cartão segue a regra matemática universal (Algoritmo de Luhn)
export function isValidCreditCardNumber(value: string): boolean {
    const rawValue = value.replace(/\D/g, ''); // Tira os espaços
    
    if (rawValue.length < 13 || rawValue.length > 19) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = rawValue.length - 1; i >= 0; i--) {
        let digit = parseInt(rawValue.charAt(i), 10);

        if (shouldDouble) {
            if ((digit *= 2) > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return (sum % 10) === 0;
}

export function isValidExpiryDate(value: string): boolean {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length !== 4) return false;

    const month = parseInt(cleanValue.substring(0, 2), 10);
    const year = parseInt(cleanValue.substring(2, 4), 10);

    if (month < 1 || month > 12) return false;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = parseInt(currentDate.getFullYear().toString().slice(-2), 10);

    if (year < currentYear) return false; // Ano no passado
    if (year === currentYear && month < currentMonth) return false; // Mês no passado deste ano

    return true;
}