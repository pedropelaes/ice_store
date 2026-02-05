'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Produtos", path: "/admin/products" },
  { name: "Pedidos", path: "/admin/orders" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#999999] text-white flex flex-col">
      <div className="p-4 text-2xl font-bold">(LOGO)</div>
      <nav className="flex-1 px-2 py-16 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <div key={item.path} className="flex gap-4 justify-center mt-2">
                <Link
                    href={item.path}
                    className={`btn-secondary w-48 justify-center ${
                        isActive 
                        ? "bg-black text-white font-bold" 
                        : "hover:bg-gray-700 text-black" 
                    }`}
                    >
                    {item.name}
                </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}