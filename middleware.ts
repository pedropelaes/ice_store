import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;
    
    // 1. Identificamos se a rota atual exige nível de ADMIN
    const isAdminPage = path.startsWith("/admin");
    const isAdminApi = path.startsWith("/api/banner") || 
                       path.startsWith("/api/products/create-product") || 
                       path.startsWith("/api/products/edit-products");

    const isNotAdmin = req.nextauth.token?.role !== "ADMIN";

    if ((isAdminPage || isAdminApi) && isNotAdmin) {
      
      if (isAdminApi) {
        return NextResponse.json({ error: "Acesso negado. Privilégios insuficientes." }, { status: 403 });
      }

      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*", 
    "/checkout/:path*", 
    "/profile/:path*",
    
    "/api/banner",
    "/api/products/create-product",
    "/api/products/edit-products"
  ],
}