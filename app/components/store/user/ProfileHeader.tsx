"use client"

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

interface ProfileHeaderProps {
    userName: string;
}

export function ProfileHeader({ userName }: ProfileHeaderProps) {
    const pathname = usePathname();

    let title = `Olá, ${userName}`;
    if (pathname === "/profile/orders") title = "Seus pedidos";
    if (pathname === "/profile/addresses") title = "Seus endereços";
    if (pathname === "/profile/cards") title = "Seus cartões";
    if (pathname === "/profile/data") title = "Seus dados";

    const isRoot = pathname === "/profile";

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 border-b border-gray-200 mb-8 flex items-center gap-4">
            {!isRoot && (
                <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
                    <ArrowLeft size={24} />
                </Link>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
                {title}
            </h1>
        </div>
    );
}