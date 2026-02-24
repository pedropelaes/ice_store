import React from "react";

interface ReviewSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ReviewSection({ title, children }: ReviewSectionProps) {
  return (
    <div className="mb-6 text-black">
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <div className="text-sm text-gray-600 leading-relaxed flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
}