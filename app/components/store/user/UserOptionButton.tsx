import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface UserOptionButtonProps {
  href: string;
  label: string;
  icon: LucideIcon;
  variant?: "default" | "danger";
}

export function UserOptionButton({ 
  href, 
  label, 
  icon: Icon, 
  variant = "default" 
}: UserOptionButtonProps) {
  
  const isDanger = variant === "danger";

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center p-8 md:p-10 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1
        ${isDanger 
          ? "bg-[#660000] text-[#FFB3B3] hover:bg-[#800000]"
          : "bg-[#E5E5E5] text-black hover:bg-[#D4D4D4]"
        }
      `}
    >
      <Icon 
        size={64} 
        strokeWidth={1.5}
        className={`mb-4 ${isDanger ? "text-[#FF6666]" : "text-black"}`} 
      />
      <span className={`font-bold text-lg text-center ${isDanger ? "text-white" : "text-black"}`}>
        {label}
      </span>
    </Link>
  );
}