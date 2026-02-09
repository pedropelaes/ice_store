import { Search } from "lucide-react";
import { ReactNode } from "react";

interface AdminToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  children?: ReactNode; // Filtros extras
}

export function AdminToolbar({ searchValue, onSearchChange, children }: AdminToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center p-2 rounded-lg mb-6 gap-4">
        
        
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={18}/>
              <input 
                 type="search" 
                 className="input-custom pl-10 placeholder-black/70 w-full min-w-[200px] md:min-w-[300px]" 
                 placeholder="Pesquisar"
                 value={searchValue}
                 onChange={(e) => onSearchChange(e.target.value)}
              />
           </div>
        </div>

        
        <div className="flex gap-2 w-full md:w-auto flex-wrap md:justify-end no-scrollbar">
            {children}
        </div>
    </div>
  );
}