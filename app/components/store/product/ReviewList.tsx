"use client"

import { useState } from "react";
import { Star, User, ChevronDown } from "lucide-react";
import Image from "next/image";

type ReviewType = {
    id: number;
    rating: number;
    description: string | null;
    image_url: string | null;
    createdAt: Date;
    user: { name: string; lastName: string };
};

export function ReviewList({ reviews }: { reviews: ReviewType[] }) {
    const [visibleCount, setVisibleCount] = useState(4);

    const showMore = () => {
        setVisibleCount((prev) => prev + 4); 
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.slice(0, visibleCount).map((review) => (
                    <div key={review.id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
                        
                        <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-900">
                                    {review.user.name} {review.user.lastName.charAt(0)}.
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                        key={star} 
                                        size={14} 
                                        className={star <= review.rating ? "fill-[#FFD700] text-[#FFD700]" : "text-gray-200"} 
                                    />
                                ))}
                            </div>
                            
                            {review.description ? (
                                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                    {`"${review.description}"`}
                                </p>
                            ) : (
                                <p className="text-gray-400 text-sm italic mb-4">
                                    O cliente não deixou um comentário.
                                </p>
                            )}

                            {/*review.image_url && (
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                    <Image 
                                        src={review.image_url} 
                                        alt="Foto da avaliação" 
                                        fill 
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                </div>
                            )*/}
                        </div>
                    </div>
                ))}
            </div>

            {/* Botão de Mostrar Mais */}
            {visibleCount < reviews.length && (
                <div className="flex justify-center mt-4">
                    <button 
                        onClick={showMore}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Ver mais avaliações ({reviews.length - visibleCount} restantes)
                        <ChevronDown size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}