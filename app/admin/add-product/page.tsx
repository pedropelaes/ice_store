"use client"

import PasswordModal from "@/app/components/modals/PasswordModal";
import { formatCurrency, formatNumbersOnly } from "@/app/lib/formaters/formaters";
import { ArrowRight, ImageIcon, Plus, Save, Trash2, UploadCloud, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useRef, useState } from "react";

export interface CategoryOption {
    id: number;
    name: string;
};

interface DraftProduct {
    id: string; // id temporário para o react map
    name: string;
    description: string;
    price: string;
    discount_price: string;
    categories: string[];
    imageFile: File | null;
    imagePreview: string;
    variants: { size: string; quantity: number }[];
};

export default function AddProductPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [drafts, setDrafts] = useState<DraftProduct[]>([]); // produtos a serem salvos

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState(""); 

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        discount_price: "",
        image_url:"" 
    });
    const [variantInput, setVariantInput] = useState({ size: "P", quantity: "" });
    const [currentVariants, setCurrentVariants] = useState<{ size: string; quantity: number }[]>([]);
    const AVAILABLE_SIZES = ["P", "M", "G", "GG", "XG", "UNIC"];

    const [dbCategories, setDbCategories] = useState<CategoryOption[]>([]); 
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]); 
    const [categoryInput, setCategoryInput] = useState(""); 
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
        try {
            const res = await fetch("/api/products/categories/get-all");
            if (res.ok) {
            const data = await res.json();
            setDbCategories(data);
            }
        } catch (error) {
            console.error("Erro ao buscar categorias", error);
        }
        };
        fetchCategories();
    }, []);

    const handleAddCategory = (categoryName: string) => {
        const trimmedName = categoryName.trim();
        if (!trimmedName) return;

        const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1); // capitaliza primeira letra
        
        if (!selectedCategories.includes(formattedName)) {  // evita categorias duplicadas
            setSelectedCategories([...selectedCategories, formattedName]);
        }

        const categoryExistsInSuggestions = dbCategories.some(
            (cat) => cat.name.toLowerCase() === formattedName.toLowerCase()
        );

        if (!categoryExistsInSuggestions) {
            setDbCategories((prev) => [
                ...prev, 
                {
                    id: Date.now(), // placeholder de id para o react
                    name: formattedName
                }
            ]);
        }
        
        setCategoryInput("");
        setShowSuggestions(false);
    };

    const handleRemoveCategory = (categoryName: string) => {
        setSelectedCategories(selectedCategories.filter((c) => c !== categoryName));
    };

    const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Não envia o form
            handleAddCategory(categoryInput);
        } else if (e.key === "Backspace" && !categoryInput && selectedCategories.length > 0) {
            // Se apagar com input vazio, remove a última tag (UX nativa)
            handleRemoveCategory(selectedCategories[selectedCategories.length - 1]);
        }
    };

    const filteredSuggestions = dbCategories.filter(
        (cat) =>
        cat.name.toLowerCase().includes(categoryInput.toLowerCase()) &&
        !selectedCategories.includes(cat.name)
    );

    const [imageFile, setImageFile] = useState<File | null>(null); 
    const [imagePreview, setImagePreview] = useState<string>(""); 

    const [error, setError] = useState("");
    const [modalError, setmodalError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            setImageFile(file);

            const previewURL = URL.createObjectURL(file);
            setImagePreview(previewURL);
        }
    };

    const removeImage = (e: SyntheticEvent) => {
        e.stopPropagation();
        setImageFile(null);
        setImagePreview("");
    };

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME || "");

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            throw new Error("Erro ao fazer upload da imagem");
        }

        const data = await res.json();
        return data.secure_url; 
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue = value;
        setError("");

        if (name === "price" || name === "discount_price") newValue = formatCurrency(value);
        if (name === "quantity") newValue = formatNumbersOnly(value);

        setFormData({ ...formData, [name]: newValue });
    };

    // Lida com o input temporário de tamanho e quantidade
    const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === "quantity") newValue = formatNumbersOnly(value);
        setVariantInput({ ...variantInput, [name]: newValue });
    };

    // Adiciona o tamanho na listinha do produto atual
    const handleAddVariant = (e: SyntheticEvent) => {
        e.preventDefault();
        if (!variantInput.quantity || Number(variantInput.quantity) <= 0) {
            setError("A quantidade do tamanho deve ser maior que zero.");
            return;
        }
        
        // Evita adicionar o mesmo tamanho duas vezes
        if (currentVariants.some(v => v.size === variantInput.size)) {
            setError(`O tamanho ${variantInput.size} já foi adicionado.`);
            return;
        }

        const isAddingUnic = variantInput.size === "UNIC";
        const hasUnicInList = currentVariants.some(v => v.size === "UNIC");
        const hasNormalInList = currentVariants.some(v => v.size !== "UNIC");

        if(isAddingUnic && hasNormalInList) {
            setError("Não é possível adicionar 'Tamanho Único' se já existem tamanhos padrão (P, M, G...) na lista.");
            return;
        }

        if(!isAddingUnic && hasUnicInList) {
            setError("Você já adicionou 'Tamanho Único'. Remova-o antes de adicionar tamanhos padrão.");
            return;
        }
        const updatedVariants = [...currentVariants, { size: variantInput.size, quantity: Number(variantInput.quantity) }];
        setCurrentVariants(updatedVariants);

        const newHasUnic = updatedVariants.some(v => v.size === "UNIC")
        const nextAvailableSize = AVAILABLE_SIZES.find((size) => {
            if(newHasUnic) return false;
            if(size === "UNIC") return false;

            return !updatedVariants.some((v) => v.size === size);
        });

        setVariantInput({ 
            size: nextAvailableSize || "P", 
            quantity: "" 
        });

        setError("");
    };

    const handleRemoveVariant = (sizeToRemove: string) => {
        setCurrentVariants(currentVariants.filter(v => v.size !== sizeToRemove));
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "O nome do produto é obrigatório.";
        if (!formData.description.trim()) return "A descrição é obrigatória.";
        
        const priceNumber = Number(formData.price.replace(/[^0-9,]/g, "").replace(",", "."));
        if (!formData.price || priceNumber <= 0) return "O preço deve ser maior que zero.";
        if (currentVariants.length === 0) return "Adicione pelo menos um tamanho e quantidade para o produto.";
        if (selectedCategories.length === 0) return "Selecione pelo menos uma categoria.";

        if(!formData.image_url && !imageFile) return "A imagem do produto é obrigatoria."
        
        return ""; 
    };

    const handleAddToList = (e: SyntheticEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) return setError(validationError);

        const newDraft: DraftProduct = {
            id: Math.random().toString(36).substr(2, 9),
            name: formData.name,
            description: formData.description,
            price: formData.price,
            discount_price: formData.discount_price,
            categories: [...selectedCategories],
            imageFile,
            imagePreview,
            variants: [...currentVariants]
        };

        setDrafts([...drafts, newDraft]);

        setFormData({ name: "", description: "", price: "", discount_price: "", image_url: "" });
        setCurrentVariants([]);
        setVariantInput({ size: "P", quantity: "" });
        setSelectedCategories([]);
        setImageFile(null);
        setImagePreview("");
        setError("");
    };

    const handleRemoveFromList = (id: string) => {
        setDrafts(drafts.filter(d => d.id !== id));
    };

    const handleFinalSubmit = async () => {
        if (!password) {
            setmodalError("Digite sua senha para confirmar.");
            return;
        }

        setLoading(true);
        setmodalError("");
        
        try{
            const uploadedProducts = await Promise.all(drafts.map(async (draft) => {
                let finalImageUrl = "";
                if (draft.imageFile) {
                    finalImageUrl = await uploadImage(draft.imageFile);
                }

                // Limpar preços
                const cleanPrice = (val: string) => Number(val.replace("R$", "").replace(/\./g, "").replace(",", ".").trim());

                return {
                    name: draft.name,
                    description: draft.description,
                    price: cleanPrice(draft.price),
                    discount_price: draft.discount_price ? cleanPrice(draft.discount_price) : undefined,
                    category: draft.categories.join(", "),
                    image_url: finalImageUrl,
                    variants: draft.variants
                };
            }));

            const res = await fetch("/api/products/create-product", {
                method: "POST",
                headers: { "Content-Type" : "application/json" },
                body: JSON.stringify({products: uploadedProducts, password})
            })

            const productData = await res.json();

            if(!res.ok){
                setLoading(false);
                throw new Error(productData.message || productData.error || "Erro ao criar produto");
            }

            alert(`${drafts.length} produto(s) criado(s) com sucesso!`);
            router.refresh();
            router.push("/admin/products");
        }catch(err: any){
            setLoading(false);
            switch(err.message){
                case "Invalid User ID":
                    setmodalError("Erro ao obter ID do admin, tente novamente");
                    break;
                case "User not found":
                    setmodalError("Admin não encontrado.");
                    break;
                case "Wrong password":
                    setmodalError("Senha invalida");
                    break;
                case "Password is required":
                    setmodalError("Digite uma senha");
                    break;
                default:
                    setmodalError(err.message || "Erro inesperado. Tente novamente");
                    break;
            }
        }
    };

    const isAddingUnico = variantInput.size === "UNIC";
    const hasUnico = currentVariants.some(v => v.size === "UNIC");
    const hasNormal = currentVariants.some(v => v.size !== "UNIC");

    const isButtonDisabled = (isAddingUnico && hasNormal) || (!isAddingUnico && hasUnico);

  return (
    <div className="min-h-screen bg-white flex flex-col"> 
      
      <header className="flex justify-between items-center p-6 text-white bg-[#999999]">
        <div className="text-2xl font-bold">(LOGO)</div>
        <h1 className="text-2xl">Criação em lote</h1>
        <div className="w-10"></div> 
      </header>

      <main className="flex-1 flex justify-center items-start p-6">
        <div className="bg-white w-full max-w-4xl rounded-xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row gap-8">
  
                <div className="w-full md:w-1/3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        hidden 
                    />

                    <div
                        onClick={handleImageClick}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 border-dashed
                            ${imagePreview ? "border-transparent" : "bg-gray-200 border-gray-300 hover:bg-gray-300"}
                            relative overflow-hidden group
                        `}
                    >
                        {imagePreview ? (
                        <>
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                                <UploadCloud size={32} />
                                <span className="text-sm font-medium">Trocar imagem</span>
                                
                                <button 
                                    onClick={removeImage}
                                    className="bg-red-500 p-2 rounded-full hover:bg-red-600 mt-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </>
                        ) : (
                        <>
                            <div className="bg-gray-700 p-6 rounded-xl mb-4">
                            <ImageIcon size={48} className="text-white" />
                            </div>
                            <span className="text-lg font-medium text-black">
                            Adicionar imagem +
                            </span>
                        </>
                        )}
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-black">Nome do produto *</label>
                        <input name="name" type="text" value={formData.name} onChange={handleChange}
                        className="input-custom w-full" placeholder="Ex: Camisa preta"></input>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-black">Descrição *</label>
                        <input name="description" type="text" value={formData.description} onChange={handleChange}
                        className="input-custom w-full" placeholder="Ex: Uma camisa estilosa..."></input>
                    </div>

                    <div className="flex flex-row gap-4">
                        <div className="flex-1 flex-col">
                            <label className="mb-1 font-medium text-black">Preço *</label>
                            <input name="price" type="text" value={formData.price} onChange={handleChange}
                            className="input-custom w-full" placeholder="Ex: R$99,99"></input>
                        </div>
                        <div className="flex-1 flex-col">
                            <label className="mb-1 font-medium text-black text-sm">Preço Promo (Opcional)</label>
                            <input name="discount_price" value={formData.discount_price} onChange={handleChange} className="input-custom w-full" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-md border border-gray-200">

                    <label className="font-medium text-black">Tamanhos e Estoque *</label>
                    <div className="flex flex-row gap-4 items-end">
                        <div className="flex-1 flex-col">
                            <span className="mb-1 text-black text-xs">Tamanho</span>
                            <select 
                                name="size" 
                                value={variantInput.size} 
                                onChange={handleVariantChange} 
                                className="input-custom w-full bg-white" 
                            >
                                {AVAILABLE_SIZES.map((size) => {
                                    const isAlreadyAdded = currentVariants.some((v) => v.size === size);

                                    const hasUnico = currentVariants.some((v) => v.size === "UNIC");
                                    const hasNormalSizes = currentVariants.some((v) => v.size !== "UNIC");
                                    
                                    const isConflicting = 
                                        (size === "UNIC" && hasNormalSizes) || // Tenta add UNIC mas já tem P/M/G
                                        (size !== "UNIC" && hasUnico);         // Tenta add P/M/G mas já tem UNIC
                                        
                                    const isDisabled = isAlreadyAdded || isConflicting;
                                    
                                    let statusText = "";
                                    if (isAlreadyAdded) statusText = "(Adicionado)";
                                    else if (isConflicting) statusText = "(Incompatível)";
                                    
                                    return (
                                        <option 
                                            key={size} 
                                            value={size} 
                                            disabled={isDisabled}
                                            className={isDisabled ? "text-gray-400 bg-gray-100" : "text-black"}
                                        >
                                            {size === "UNIC" ? "Tamanho Único" : size} {statusText}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="flex-1 flex-col">
                            <span className="mb-1 text-black text-xs">Quantidade</span>
                            <input name="quantity" value={variantInput.quantity} onChange={handleVariantChange} className="input-custom w-full" placeholder="Ex: 10" />
                        </div>
                        <button type="button" disabled={isButtonDisabled}
                        onClick={handleAddVariant} className="bg-gray-800 text-white px-4 h-[42px] rounded-md hover:bg-black transition-colors text-sm font-medium disabled:bg-black/50">
                            Adicionar
                        </button>
                    </div>

                    {currentVariants.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-200">
                            {currentVariants.map((variant) => (
                                <div key={variant.size} className="bg-white border border-gray-300 px-3 py-1.5 rounded-full flex items-center gap-2 text-sm text-black shadow-sm">
                                    <span className="font-bold">{variant.size === "UNIC" ? "Tamanho Único" : variant.size}</span>
                                    <span className="text-gray-500">({variant.quantity} un)</span>
                                    <button type="button" onClick={() => handleRemoveVariant(variant.size)} className="text-red-500 hover:text-red-700 ml-1">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                    <div className="flex flex-col relative">
                    <label className="mb-1 font-medium text-black">Categoria *</label>
                    
                    <div className="input-custom w-full min-h-[42px] flex flex-wrap gap-2 items-center p-2 bg-white">

                        {selectedCategories.map((cat) => (
                            <span key={cat} className="bg-gray-200 text-black px-2 py-1 rounded-md text-sm flex items-center gap-1">
                                {cat}
                                <button onClick={() => handleRemoveCategory(cat)} className="hover:text-red-500">
                                    <X size={14} />
                                </button>
                            </span>
                        ))}

                        <input 
                            type="text" 
                            className="outline-none flex-1 bg-transparent min-w-[120px]" 
                            placeholder={selectedCategories.length === 0 ? "Selecione ou digite..." : ""}
                            value={categoryInput}
                            onChange={(e) => {
                                setCategoryInput(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            onKeyDown={handleCategoryKeyDown}
                        />
                    </div>

                    {showSuggestions && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-48 overflow-y-auto">
                            {filteredSuggestions.length > 0 ? (
                                filteredSuggestions.map((cat) => (
                                    <div 
                                        key={cat.id} 
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleAddCategory(cat.name)}
                                    >
                                        <span className="text-black">{cat.name}</span>
                                    </div>
                                ))
                            ) : categoryInput.trim().length > 0 ? (
                                <div 
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-blue-600 font-medium"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleAddCategory(categoryInput)}
                                >
                                    Criar "{categoryInput}"
                                </div>
                            ) :
                                <div className="px-4 py-2 text-gray-400 text-sm">
                                    Nenhuma categoria encontrada.
                                </div> 
                            }
                        </div>
                    )}
                    {showSuggestions && (
                        <div className="fixed inset-0 z-0" onClick={() => setShowSuggestions(false)}></div>
                    )}
                </div>
            </div>
        </div>
            <div className="flex flex justify-center mt-8 mb-2">
                <button className="btn-primary" onClick={handleAddToList}>
                    Adicionar a lista
                    <Plus></Plus>
                </button>
            </div>
            <div className="flex flex justify-center mb-2">
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
        </div>
        
        <div className="bg-white w-full lg:w-1/3 rounded-xl p-6 shadow-lg border border-gray-200 sticky top-6">
            <h2 className="text-xl font-bold mb-4 text-black flex justify-between">
                Itens na Lista <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">{drafts.length}</span>
            </h2>

            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-2">
                {drafts.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Nenhum produto adicionado ainda.</p>
                ) : (
                    drafts.map((draft) => (
                        <div key={draft.id} className="flex gap-4 p-3 border rounded-lg items-center bg-gray-50">
                            <img src={draft.imagePreview} alt="" className="w-16 h-16 object-cover rounded-md" />
                            <div className="flex-1">
                                <p className="font-bold text-black text-sm">{draft.name}</p>
                                <p className="text-xs text-gray-600">{draft.price} • Tam: {draft.variants.length} (Qtd: {draft.variants[0].quantity})</p>
                            </div>
                            <button onClick={() => handleRemoveFromList(draft.id)} className="text-red-500 hover:bg-red-100 p-2 rounded-md">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <button 
                className="w-full btn-primary py-3 flex justify-center items-center gap-2 disabled:opacity-50"
                disabled={drafts.length === 0}
                onClick={() => setPasswordModalOpen(true)}
            >
                <Save size={20} />
                Salvar Tudo no Banco
            </button>
        </div>
      </main>

      {passwordModalOpen && (
        <PasswordModal
            isOpen={passwordModalOpen}
            handleClose={() => {
                setmodalError("");
                setPassword("");
                setPasswordModalOpen(!passwordModalOpen);
            }}
        >
            <div className="flex flex-col items-center text-center">
                <h2 className="text-xl font-bold text-black mb-2">
                    Confirme sua identidade
                </h2>

                <h3 className="text-black/70 mb-5">
                    Para criar o produto, digite sua senha:
                </h3>

                <div className="relative mb-5">
                    <input name="password" type={showPassword ? "text" : "password"} 
                        placeholder="Digite sua senha" className="input-custom" required 
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        )}
                    </button>
                </div>

                <button className="btn-primary" onClick={handleFinalSubmit} disabled={loading}>
                    {loading ? "Enviando..." : "Avançar"}
                    {!loading && <ArrowRight/>}
                </button>
                {modalError && <p className="text-red-500 text-sm">{modalError}</p>}
            </div>
        </PasswordModal>
      )}
    </div>
  );
}