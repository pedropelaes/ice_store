"use client"

import PasswordModal from "@/app/components/modals/PasswordModal";
import { formatCurrency, formatNumbersOnly } from "@/app/lib/formaters/formaters";
import { ArrowRight, ImageIcon, Plus, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useRef, useState } from "react";

export default function AddProductPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState(""); 

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
        image_url: ""
    })

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue = value;
        setError("");

        switch (name) {
        case "price":
            newValue = formatCurrency(value);
            break;

        case "quantity":
            newValue = formatNumbersOnly(value);
            break;
        
        default:
            
            break;
        }

        setFormData({
            ...formData,
            [name]: newValue
        })
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "O nome do produto é obrigatório.";
        if (!formData.description.trim()) return "A descrição é obrigatória.";
        
        const priceNumber = Number(formData.price.replace(/[^0-9,]/g, "").replace(",", "."));
        if (!formData.price || priceNumber <= 0) return "O preço deve ser maior que zero.";
        
        if (!formData.quantity) return "A quantidade é obrigatória.";
        if (!formData.category.trim()) return "A categoria é obrigatória.";

        if(!formData.image_url && !imageFile) return "A imagem do produto é obrigatoria."
        
        return ""; 
    };

    const handleInitialSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setPasswordModalOpen(true);
    };

    const handleFinalSubmit = async () => {
        if (!password) {
            setmodalError("Digite sua senha para confirmar.");
            return;
        }

        setLoading(true);
        setmodalError("");
        
        try{
            let finalImageUrl = formData.image_url;

            if(imageFile) {
                try{
                    finalImageUrl = await uploadImage(imageFile);
                }catch(uploadError){
                    setLoading(false);
                    setmodalError("Erro ao fazer upload da imagem. Tente novamente.");
                    return;
                }
            }

            const priceClean = formData.price
                .replace("R$", "")      
                .replace(/\./g, "")     
                .replace(",", ".")    
                .trim();

            const payload = {
                ...formData,
                price: priceClean,               
                quantity: Number(formData.quantity), 
                image_url: finalImageUrl,
                password
            };

            const res = await fetch("/api/products/create-product", {
                method: "POST",
                headers: { "Content-Type" : "application/json" },
                body: JSON.stringify(payload)
            })

            const productData = await res.json();

            if(!res.ok){
                setLoading(false);

                if (productData.errors) {
                    const zodError = Object.values(productData.errors)[0] as any;
                    throw new Error(zodError.message || JSON.stringify(zodError));
                }

                throw new Error(productData.message || productData.error || "Erro ao criar produto");
            }

            alert("Produto criado com sucesso!");
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

  return (
    <div className="min-h-screen bg-white flex flex-col"> 
      
      <header className="flex justify-between items-center p-6 text-white bg-[#999999]">
        <div className="text-2xl font-bold">(LOGO)</div>
        <h1 className="text-2xl">Adicionar produto</h1>
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
                            <label className="mb-1 font-medium text-black">Quantidade *</label>
                            <input name="quantity" type="text" value={formData.quantity} onChange={handleChange}
                             className="input-custom w-full" placeholder="Ex: 90"></input>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-black">Categoria *</label>
                        <input name="category" value={formData.category} onChange={handleChange}
                        type="text" className="input-custom w-full" placeholder="Ex: Uma camisa estilosa..."></input>
                    </div>
                </div>
            </div>
            <div className="flex flex justify-center mt-8 mb-2">
                <button className="btn-primary" onClick={handleInitialSubmit}>
                    Criar produto
                    <Plus></Plus>
                </button>
            </div>
            <div className="flex flex justify-center mb-2">
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
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