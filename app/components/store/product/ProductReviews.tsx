import { Star } from "lucide-react";
import { ReviewList } from "./ReviewList"; // Importe o novo componente
import { getProductReviews } from "@/app/actions/review";

export async function ProductReviews({ productId }: { productId: number }) {
    const reviews = await getProductReviews(productId);

    if (reviews.length === 0) {
        return (
            <div className="border-t border-gray-100 pt-12 mt-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Avaliações de Clientes</h2>
                <p className="text-gray-500">Este produto ainda não possui avaliações. Seja o primeiro a avaliar após a compra!</p>
            </div>
        );
    }

    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    return (
        <div className="border-t border-gray-100 pt-12 mt-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Avaliações de Clientes</h2>
                
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg w-max border border-gray-200">
                    <span className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                                key={star} 
                                size={18} 
                                className={star <= Math.round(averageRating) ? "fill-[#FFD700] text-[#FFD700]" : "text-gray-300"} 
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                        ({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})
                    </span>
                </div>
            </div>

            {/* Aqui delegamos a renderização da lista para o Client Component */}
            <ReviewList reviews={reviews} />
            
        </div>
    );
}