"use client"

import { useRouter } from "next/navigation";
import { useRef, useState, SyntheticEvent } from "react";
import { ImageIcon, Save, Trash2, UploadCloud } from "lucide-react";
import { uploadImage } from "@/app/lib/upload-image";
import Image from "next/image";

export default function UpdateBannerPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [imageFile, setImageFile] = useState<File | null>(null); 
    const [imagePreview, setImagePreview] = useState<string>(""); 
    const [routePath, setRoutePath] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file) {
            setImageFile(file);
            const previewURL = URL.createObjectURL(file);
            setImagePreview(previewURL);
            setError("");
        }
    };

    const removeImage = (e: SyntheticEvent) => {
        e.stopPropagation();
        setImageFile(null);
        setImagePreview("");
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!imageFile) {
            setError("Por favor, selecione uma imagem para o banner.");
            return;
        }

        if (!routePath.trim()) {
            setError("Por favor, informe a rota de destino do banner.");
            return;
        }

        setLoading(true);

        try {
            // 1. O NAVEGADOR faz a compressão e envia pro Cloudinary
            const uploadedUrl = await uploadImage(imageFile);

            if (!uploadedUrl) {
                throw new Error("Falha ao fazer upload da imagem.");
            }

            // 2. Envia APENAS o JSON (texto) para a sua Rota API
            const res = await fetch("/api/banner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    image_url: uploadedUrl, 
                    route: routePath.trim() 
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.message || "Erro ao salvar o banner.");
            }

            setSuccess("Banner atualizado com sucesso!");
            setImageFile(null);
            setImagePreview("");
            setRoutePath("");
            
            router.push("/")
        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage || "Erro inesperado ao enviar o banner.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="flex justify-between items-center p-6 text-white bg-[#999999]">
                <div className="text-2xl font-bold hover:cursor-pointer"
                onClick={() => {router.push("/")}} >(LOGO)</div>
                <h1 className="text-2xl">Gerenciar Banner Inicial</h1>
                <div className="w-10"></div> 
            </header>

            <main className="flex-1 flex justify-center items-start p-6">
                <form 
                    onSubmit={handleSubmit} 
                    className="bg-white w-full max-w-3xl rounded-xl p-8 shadow-lg border border-gray-200"
                >
                    <div className="space-y-6">
                        <div className="flex flex-col">
                            <label className="mb-2 font-medium text-black">Imagem do Banner *</label>
                            
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                hidden 
                            />

                            <div
                                onClick={handleImageClick}
                                className={`w-full aspect-video md:h-64 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all border-2 border-dashed
                                    ${imagePreview ? "border-transparent" : "bg-gray-50 border-gray-300 hover:bg-gray-100"}
                                    relative overflow-hidden group
                                `}
                            >
                                {imagePreview ? (
                                    <>
                                        <Image
                                            src={imagePreview}
                                            alt="Preview do Banner"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                                            <UploadCloud size={32} />
                                            <span className="text-sm font-medium">Trocar imagem</span>
                                            
                                            <button 
                                                type="button"
                                                onClick={removeImage}
                                                className="bg-red-500 p-2 rounded-full hover:bg-red-600 mt-2 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="bg-gray-200 p-4 rounded-full mb-3">
                                            <ImageIcon size={40} className="text-gray-500" />
                                        </div>
                                        <span className="text-base font-medium text-gray-700">
                                            Clique para fazer upload do banner
                                        </span>
                                        <span className="text-sm text-gray-400 mt-1">
                                            Formato recomendado: 1920x600px
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 font-medium text-black">
                                Rota de destino ao clicar *
                            </label>
                            <input 
                                name="route" 
                                type="text" 
                                value={routePath} 
                                onChange={(e) => {
                                    setRoutePath(e.target.value);
                                    setError("");
                                }}
                                className="input-custom w-full" 
                                placeholder="Ex: /catalog?sale=true ou /catalog?category=Inverno"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Para onde o cliente deve ir quando clicar neste banner?
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
                            {success}
                        </div>
                    )}

                    
                    <div className="flex justify-center mt-8 border-t   pt-6">
                        <button 
                            type="submit" 
                            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                "Salvando..."
                            ) : (
                                <>
                                    <Save size={20} />
                                    Publicar Banner
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}