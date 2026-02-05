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