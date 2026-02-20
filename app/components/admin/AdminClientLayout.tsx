'use client'

import { useState } from "react";
import Sidebar from "./sidebar";
import { Menu } from "lucide-react";

interface AdminClientLayoutProps {
  children: React.ReactNode;
  userName?: string | null;
}

export function AdminClientLayout({ children, userName }: AdminClientLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      
      <Sidebar isOpen={isSidebarOpen} />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-[#999999] text-white shadow p-4 flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-black/10 rounded-md transition-colors text-white"
            aria-label="Alternar Menu"
          >
            <Menu size={28} />
          </button>
          
          <h2 className="text-2xl font-medium">Bem vindo, {userName}</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
      
    </div>
  );
}