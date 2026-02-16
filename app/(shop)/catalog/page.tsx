import { Prisma, Size } from "@/app/generated/prisma";
import { serializeProduct } from "../page";
import prisma from "@/app/lib/prisma";
import { SortDropdown } from "@/app/components/store/SortDropdown";
import { FilterSidebar } from "@/app/components/store/FilterSidebar";
import { ProductCard } from "@/app/components/store/ProductCard";
import { Pagination } from "@/app/components/store/Pagination";

const ITEMS_PER_PAGE = 20;

function isValidSize(size: string): size is Size {
    return Object.values(Size).includes(size as Size);
}

async function getCatalogData(searchParams: { [key: string]: string | string[] | undefined }) {
    const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
    const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'newest';
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;

    const sizeParam = typeof searchParams.size === 'string' ? searchParams.size : undefined;
    const minPrice = typeof searchParams.minPrice === 'string' && !isNaN(Number(searchParams.minPrice)) 
        ? Number(searchParams.minPrice) 
        : undefined;
    const maxPrice = typeof searchParams.maxPrice === 'string' && !isNaN(Number(searchParams.maxPrice)) 
        ? Number(searchParams.maxPrice) 
        : undefined;
    const sale = searchParams.sale === 'true';

    const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
    const currentPage = page > 0 ? page : 1;
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    const where: Prisma.ProductWhereInput ={
        active: 'ACTIVE',
        ...(category && { category: { some: { name: category }} }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }),
        ...(sizeParam && isValidSize(sizeParam) && {
            items: {
                some: {
                    size: sizeParam,
                    quantity: { gt: 0 }
                }
            }
        }),
        ...((minPrice !== undefined || maxPrice !== undefined) && {
            price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
            }
        }),
        ...(sale && {
            discount_price: {
                gt: 0
            }
        })
    };

    let orderBy: Prisma.ProductOrderByWithRelationInput = { created_at: 'desc' };

    switch (sort) {
        case 'price_asc': 
            orderBy = { price: 'asc' }; 
            break;
        case 'price_desc': 
            orderBy = { price: 'desc' }; 
            break;
        case 'name_asc':
            orderBy = { name: 'asc' }; 
            break;
        case 'newest': 
        default: 
            orderBy = { created_at: 'desc' }; 
            break;
    }

    const [productsRaw, totalProducts,categories] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy,
            take: ITEMS_PER_PAGE,
            skip: skip,
            include: { category: true, items: true }
        }),

        prisma.product.count({where}),
        
        prisma.category.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { products: { where: { active: 'ACTIVE' } } } }
            }
        }),
    ]);

    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);

    return {
        products: productsRaw.map(serializeProduct),
        categories,
        pagination: {
            currentPage, 
            totalPages,
            totalItems: totalProducts
        }
    }
}

export default async function CatalogPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams;
    const { products, categories, pagination } = await getCatalogData(params);

    let pageTitle = "Catálogo";

    if (params.search) {
        pageTitle = `Busca: "${params.search}"`;
    } else if (params.sale === 'true') {
        pageTitle = "Ofertas";
    } else if (params.sort === 'newest') {
        pageTitle = "Lançamentos";
    } else if (params.category) {
        pageTitle = Array.isArray(params.category) ? params.category[0] : params.category;
    }
    pageTitle = `${pageTitle} (${pagination.totalItems})`
  return (
    <div className="bg-white min-h-screen text-black pb-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                {params.search && <span>para "{params.search}"</span>}
                {params.category && <span className="bg-gray-100 px-2 rounded-full text-xs flex items-center">Categ: {params.category}</span>}
                {params.size && <span className="bg-gray-100 px-2 rounded-full text-xs flex items-center">Tam: {params.size}</span>}
            </div>
          </div>
          <SortDropdown />
        </div>
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          <FilterSidebar categories={categories} />

          <div className="flex-1">
            {products.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages = {pagination.totalPages}
                    />
                </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-500 font-medium text-lg">Nenhum produto encontrado</p>
                <p className="text-gray-400 text-sm mt-1">Tente limpar os filtros ou buscar por outro termo.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}