import { ElementType } from "react";

interface InfoCardProps {
    title: string;
    value: string;
    icon: ElementType;
    description?: string; 
}

export function InfoCard({ title, value, icon: Icon, description} : InfoCardProps) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <span className="text-lg font-medium text-gray-800">
                {title}
            </span>


            <div className="flex w-full bg-[#434343] items-center justify-between p-4 rounded-lg shadow-sm h-16">
                <div className="flex flex-col justify-center">
                    <span className="text-2xl font-bold text-white tracking-tight">
                        {value}
                    </span>
                    
                    {description && (
                        <span className="text-sm font-medium text-green-500">
                            {description}
                        </span>
                    )}
                </div>

                <div className="text-[#767676] shrink-0">
                    <Icon className="w-8 h-8" />
                </div>
            </div>
        </div>
    )
}