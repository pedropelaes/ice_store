"use server"
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "../lib/get-user";
import prisma from "@/app/lib/prisma"; 

export interface Review {
        rating: number;
        description: string | undefined;
        image_url: string | undefined;
        productId: number;     
    }

export async function publishProductReview(review: Review) {
    try{
        const authUser = await getAuthenticatedUser();
        if(!authUser) return { success: false, error: "Usuário não autenticado." };

        if(review.rating < 1 || review.rating > 5 ) return { success: false, error: "A nota deve ser entre 1 e 5 estrelas." };

        const user = await prisma.user.findUnique({
                where: { email: authUser.email }
            });
        if (!user) return { success: false, error: "Usuário não encontrado no banco." };

        const hasBoughtProduct = await prisma.orderItem.findFirst({
            where: {
                product_id: review.productId,
                order: {
                    user_id: user.id,
                    status: { in: ['PAID', 'SHIPPED'] } 
                }
            }
        });

        if(!hasBoughtProduct) return { success: false, error: "Ação não permitida. Usuário não comprou ou não pagou pelo item." };

        const existingReview = await prisma.review.findFirst({
            where: {
                userId: user.id,
                productId: review.productId
            }
        });

        if (existingReview) {
            return { success: false, error: "Você já enviou uma avaliação para este produto." };
        }

        await prisma.review.create({
            data: {
                rating: review.rating,
                description: review.description || "",
                image_url: review.image_url || null,
                productId: review.productId,
                userId: user.id
            }
        });

        revalidatePath('/profile/orders');
        revalidatePath(`/product/${review.productId}`);

        return { success: true };
    }catch(error){
        console.error("Erro ao publicar review: ", error);
        return { success: false, error: "Erro interno ao publicar avaliação." }
    }
}

export async function getProductReviews(productId: number) {
    try{
        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: { name: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        if (reviews.length === 0) return [];
    
        return reviews;
    }catch(error){
        console.error("Erro ao buscar reviews: ", error);
        return [];
    }
}

export async function deleteReview(productId: number) {
    try{
        const authUser = await getAuthenticatedUser();
        if(!authUser) return { success: false, error: "Usuário não autenticado." };

        const user = await prisma.user.findUnique({
            where: { email: authUser.email }
        });

        if (!user) {
            return { success: false, error: "Usuário não encontrado no banco." };
        }

        const res = await prisma.review.deleteMany({
            where: { productId: productId, userId: user.id }
        });

        if (res.count === 0) {
            return { success: false, error: "Avaliação não encontrada ou você não tem permissão." };
        }
        
        revalidatePath("/profile/orders")
        revalidatePath(`/product/${productId}`)
        
        return { success: true, message:"Avaliação apagada." }
    }catch(error){
        console.error("Erro ao apagar avaliação: ", error);
        return { success: false, error: "Erro interno ao apagar avaliação." }
    }    
}

