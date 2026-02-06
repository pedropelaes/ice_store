"use-client"

import { getServerSession } from "next-auth";
import { Header } from "../components/store/header";
import { authOptions } from "../lib/auth";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
  return (
    <div className="flex flex-col min-h-screen">
      <Header user={session?.user} />
      
      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-[#999999] text-white p-8 mt-auto text-center">
        <div className="flex justify-center gap-12 mb-4">
            <span>Sobre</span>
            <span>Suporte</span>
            <span>Nossas redes</span>
        </div>
      </footer>
    </div>
  );
}