import { OrderCard } from "@/app/components/store/user/OrderItem";
import { getAuthenticatedUser } from "@/app/lib/get-user";
import prisma from "@/app/lib/prisma"
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function UserOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) redirect('/auth/login');
    
    const resolvedSearchParams = await searchParams;
    const currentPage = Number(resolvedSearchParams.page) || 1;
    const itemsPerPage = 5; 
    const skip = (currentPage - 1) * itemsPerPage;

    const [ordersRaw, totalOrders] = await Promise.all([
        prisma.order.findMany({
            where: { user_id: authUser.id },
            orderBy: { orderedAt: 'desc' },
            skip: skip,
            take: itemsPerPage,
            include: {
                orderItems: {
                    include: { product: true }
                }
            }
        }),
        prisma.order.count({ where: { user_id: authUser.id } })
    ]);

    const totalPages = Math.ceil(totalOrders / itemsPerPage);

    const serializedOrders = ordersRaw.map(order => ({
        id: order.id,
        orderedAt: order.orderedAt.toISOString(),
        total_final: Number(order.total_final),
        status: order.status,
        orderItems: order.orderItems.map(item => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            size: item.size,
            product: {
                name: item.product.name,
                image_url: item.product.image_url,
            }
        }))
    }));

    return (
        <div className="max-w-4xl mx-auto px-4">
            
            {serializedOrders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Você ainda não tem nenhum pedido.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {serializedOrders.map((order, index) => (
                        <div
                            key={order.id}
                            className="opacity-0 animate-fade-in-up"
                            style={{ 
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: 'forwards'
                            }}
                        >
                            <OrderCard order={order as any} />
                        </div>
                    ))}

                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            {currentPage > 1 ? (
                                <Link 
                                    href={`/profile/orders?page=${currentPage - 1}`}
                                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-bold"
                                >
                                    Anterior
                                </Link>
                            ) : <div className="w-20"></div>}
                            
                            <span className="text-sm font-bold text-gray-500">
                                Página {currentPage} de {totalPages}
                            </span>

                            {currentPage < totalPages ? (
                                <Link 
                                    href={`/profile/orders?page=${currentPage + 1}`}
                                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-bold"
                                >
                                    Próxima
                                </Link>
                            ) : <div className="w-20"></div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}