"use client"

import Link from "next/link";
import { LayoutDashboard, LogOut, Search, ShoppingCart, User } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
  }
}

function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get("search") || "");

  useEffect(() => {
    setTerm(searchParams.get("search") || "");
  }, [searchParams]); 

  const handleSearch = () => {
    if(term.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(term.trim())}`);
    } else {
      router.push(`/catalog`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative rounded-full bg-white text-black">
        <input 
          type="search"
          placeholder="Pesquisar" 
          className="pl-10 pr-4 py-2 rounded-full text-sm outline-none w-[200px] transition-all focus:w-[240px]"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
            onClick={handleSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black z-10"
            aria-label="Buscar"
        >
            <Search className="w-4 h-4" />
        </button>
    </div>
  )
}


export function Header({user}: HeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<null | "user">(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
              setActiveDropdown(null);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
        
  return (
    <header className="w-full bg-[#999999] text-white py-4 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-serif font-bold">
            (LOGO)
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/catalog" className="hover:text-gray-200 transition-colors">
              Catálogo
            </Link>
            <Link href="/catalog?sale=true" className="hover:text-gray-200 transition-colors">
              Ofertas
            </Link>
            <Link href="/catalog?sort=newest" className="hover:text-gray-200 transition-colors">
              Lançamentos
            </Link>
            <Link href="/catalog?category=Masculino" className="hover:text-gray-200 transition-colors">
              Masculino
            </Link>
            <Link href="/catalog?category=Feminino" className="hover:text-gray-200 transition-colors">
              Feminino
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          
          <Suspense fallback={<div className="w-[200px] h-9 bg-white/20 rounded-full animate-pulse" />}>
             <SearchBar />
          </Suspense>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="hover:opacity-80">
              <ShoppingCart className="w-6 h-6" />
            </Link>
            
            
            <div className="relative" ref={dropdownRef}>
                {user ? (
                    
                    <>
                        <button 
                            className="hover:opacity-80 flex items-center focus:outline-none"
                            onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                            
                        >
                            <User className="w-6 h-6" />
                        </button>

                        {activeDropdown === "user" && (
                            <div className="absolute top-full mt-3 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-48 overflow-hidden text-black animate-in fade-in zoom-in-95 duration-100">
                                
                                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                    <p className="text-xs text-gray-500">Logado como</p>
                                    <p className="text-sm font-bold truncate">{user?.name}</p>
                                </div>

                                <Link 
                                    href="/admin/dashboard" 
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                                    onClick={() => setActiveDropdown(null)}
                                >
                                    <LayoutDashboard size={16} />
                                    Painel Admin
                                </Link>

                                <Link 
                                    href="/profile" 
                                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                                    onClick={() => setActiveDropdown(null)}
                                >
                                    <User size={16} />
                                    Minha Conta
                                </Link>

                                <button 
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                                >
                                    <LogOut size={16} />
                                    Sair
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <Link href="/auth/login" className="hover:opacity-80">
                        <User className="w-6 h-6" />
                    </Link>
                )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}