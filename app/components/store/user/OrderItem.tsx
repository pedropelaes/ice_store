"use client"

import { SyntheticEvent, useRef, useState } from "react";
import { ChevronDown, Image as ImageIcon, Star, X } from "lucide-react";
import Image from "next/image";
import { OrderStatus, Size } from "@/app/generated/prisma";
import PasswordModal from "../../modals/PasswordModal";
import { uploadImage } from "@/app/lib/upload-image";
import { publishProductReview, Review } from "@/app/actions/review";

type OrderItem = {
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    size: Size;
    product: {
        name: string;
        image_url: string | null;
    };
};

type OrderProp = {
    id: number;
    orderedAt: string;
    total_final: number;
    status: OrderStatus;
    orderItems: OrderItem[];
};

export function OrderCard({ order, reviewedProductIds }: { order: OrderProp, reviewedProductIds: number[]  }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewingProduct, setReviewingProduct] = useState<{id: number, name: string} | null>(null);
    
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [description, setDescription] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null); 
    const [imagePreview, setImagePreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'PAID': return { label: 'Pago', bg: 'bg-[#12581D] text-[#00FF28]' };
            case 'PENDING': return { label: 'Aguardando Pagamento', bg: 'bg-[#9A7300] text-[#FFE9A7]' };
            case 'CANCELED': return { label: 'Cancelado', bg: 'bg-[#900A00] text-[#FF7272]' };
            default: return { label: status, bg: 'bg-gray-500 text-white' };
        }
    };

    const statusInfo = getStatusStyle(order.status);

    const formattedDate = new Date(order.orderedAt).toLocaleDateString('pt-BR');

    const handleReviewClick = (productId: number, productName: string) => {
        setReviewingProduct({ id: productId, name: productName });
        setIsReviewModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsReviewModalOpen(false);
        setReviewingProduct(null);
        setRating(5);
        setDescription("");
        setImageFile(null);
        setImagePreview("");
    };

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

    const handleSubmitReview = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if(!reviewingProduct) return;

        setIsLoading(true);
        setErrorMsg("");
  
        let image_url = undefined;
        if(imageFile) image_url = await uploadImage(imageFile);

        try {
        let image_url = undefined;
        
        if (imageFile) {
            image_url = await uploadImage(imageFile);
            if (!image_url) throw new Error("Falha ao fazer upload da imagem.");
        }

        const review: Review = {
            rating: rating,
            description: description,
            image_url: image_url,
            productId: reviewingProduct.id,
        }

        const res = await publishProductReview(review);
        
        if (!res.success) {
            setErrorMsg(res.error || "Erro ao avaliar produto.");
            return;
        }
        
        alert("Avaliação publicada com sucesso!");
        handleCloseModal();
    } catch (error) {
        console.error(error);
        setErrorMsg("Ocorreu um erro inesperado ao publicar.");
    } finally {
        setIsLoading(false);
    }
    };

    return (
        <div className="bg-[#E5E5E5] rounded-xl overflow-hidden text-black transition-all duration-300">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-[#D4D4D4] transition-colors"
            >
                <div className="flex items-center gap-3 font-bold flex-wrap text-sm md:text-base">
                    <span>#{order.id.toString().padStart(4, '0')}</span>
                    <span>-</span>
                    <span>{formattedDate}</span>
                    <span>-</span>
                    <span>Total: R$ {order.total_final.toFixed(2).replace('.', ',')}</span>
                    <span>-</span>
                    <span className={`px-3 py-0.5 rounded-full text-xs ${statusInfo.bg}`}>
                        {statusInfo.label}
                    </span>
                </div>

                
                <ChevronDown 
                    size={24} 
                    className={`transform transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                />
            </button>

            <div className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-gray-300 bg-gray-50/50">
                        <div className="flex flex-col gap-4">
                            {order.orderItems.map((item) => {
                                const hasReviewed = reviewedProductIds.includes(item.product_id);
                                return (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {item.product.image_url ? (
                                            <Image 
                                                src={item.product.image_url} 
                                                alt={item.product.name}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="text-gray-400" />
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg leading-tight">
                                            {item.product.name} - R$ {item.unit_price.toFixed(2).replace('.', ',')}
                                        </span>
                                        <span className="text-gray-600 text-sm">
                                            Tamanho: {item.size} &nbsp;&nbsp;|&nbsp;&nbsp; 
                                            Quantidade: {item.quantity} &nbsp;&nbsp;
                                            (Total: R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')})
                                        </span>
                                    </div>

                                    {(order.status === 'PAID' || order.status === 'SHIPPED') && (
                                        hasReviewed ? (
                                            <div className="ml-auto mt-2 sm:mt-0 flex items-center justify-center gap-1.5 bg-gray-200 text-gray-500 font-bold py-2 px-4 rounded-lg text-sm shadow-sm whitespace-nowrap cursor-not-allowed">
                                                <Star size={16} className="fill-gray-400 text-gray-400" />
                                                Avaliado
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleReviewClick(item.product_id, item.product.name)}
                                                className="ml-auto mt-2 sm:mt-0 flex items-center justify-center gap-1.5 bg-[#FFD700] hover:bg-[#F2C900] text-yellow-950 font-bold py-2 px-4 rounded-lg text-sm transition-colors shadow-sm whitespace-nowrap"
                                            >
                                                <Star size={16} className="fill-yellow-950" />
                                                Avaliar Item
                                            </button>
                                        )
                                    )}
                                </div>
                            )
                            })}
                        </div>
                    </div>
                </div>
            </div>
            {isReviewModalOpen && reviewingProduct && (
                <PasswordModal isOpen={isReviewModalOpen} handleClose={handleCloseModal}>
                    <div className="p-6 sm:p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                            Avaliar Produto
                        </h3>
                        <p className="text-center text-gray-500 text-sm mb-6 truncate px-4">
                            {reviewingProduct.name}
                        </p>

                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Sua nota</span>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((starValue) => (
                                        <button
                                            key={starValue}
                                            type="button"
                                            onClick={() => setRating(starValue)}
                                            onMouseEnter={() => setHoverRating(starValue)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star 
                                                size={32} 
                                                className={`transition-colors duration-200 ${
                                                    starValue <= (hoverRating || rating) 
                                                        ? "fill-[#FFD700] text-[#FFD700]" 
                                                        : "text-gray-300"
                                                }`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição (opcional)
                                </label>
                                <textarea 
                                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-black focus:border-black outline-none resize-none" 
                                    placeholder="O que achou sobre o produto? Qualidade, tamanho, etc..."
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Adicionar foto (opcional)
                                </label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    ref={fileInputRef} 
                                    onChange={handleImageChange} 
                                    className="hidden" 
                                />
                                
                                {imagePreview ? (
                                    <div className="relative w-24 h-24 border border-gray-200 rounded-lg p-1 bg-white shadow-sm">
                                        <Image 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            fill
                                            className="object-cover rounded-md p-1"
                                        />
                                        <button 
                                            type="button"
                                            onClick={removeImage} 
                                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={handleImageClick} 
                                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                    >
                                        <ImageIcon size={28} className="mb-2 text-gray-400" />
                                        <span className="text-sm font-medium">Clique para fazer upload</span>
                                        <span className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</span>
                                    </button>
                                )}
                            </div>

                            {errorMsg && (
                                <p className="text-sm text-red-600 font-medium bg-red-50 p-2 rounded-md text-center">
                                    {errorMsg}
                                </p>
                            )}

                            <div className="flex pt-4 justify-center border-t border-gray-100">
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="btn-primary w-full sm:w-auto px-12 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>Processando...</>
                                    ) : (
                                        "Publicar Avaliação"
                                    )}
                                </button>
                            </div>
                        </form>

                    </div>
                </PasswordModal>
            )}
        </div>
    );
}