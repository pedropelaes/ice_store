import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  children?: ReactNode; 
}

export function AdminPageHeader({ title, children }: AdminPageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-xl font-bold text-black">{title}</h1>
      <div className="flex gap-3">
        {children}
      </div>
    </div>
  );
}