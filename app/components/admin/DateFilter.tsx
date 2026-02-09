import { Calendar, X } from "lucide-react";
import { useRef } from "react";

interface DateFilterProps {
    date: string;
    setDate: (date: string) => void;
}

export function DateFilter({ date, setDate }: DateFilterProps) {
    const dateInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="relative bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer h-10 flex items-center"
             onClick={() => dateInputRef.current?.showPicker()}
        >
            <div className={`flex items-center gap-2 pl-3 py-2 text-sm font-medium text-gray-700 ${date ? 'text-black pr-8' : 'pr-3'}`}>
                <Calendar size={16} />
                <span>
                    {date 
                        ? new Date(date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) 
                        : "Selecione uma data"}
                </span>
            </div>

            <input 
                ref={dateInputRef}
                type="date" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            {date && (
                <button 
                    onClick={(e) => { e.stopPropagation(); setDate(""); }} 
                    className="absolute right-2 text-red-500 hover:text-red-700 z-20 bg-white rounded-full p-0.5"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    )
}