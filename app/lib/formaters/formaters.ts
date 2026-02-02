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