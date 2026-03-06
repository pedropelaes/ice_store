"use client"

import { Pencil, Check, X, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";


type CellValue = string | number | string[] | number[] | null | undefined;

interface EditableCellProps {
  value: CellValue;
  isModified?: boolean;
  type?: "text" | "number" | "select" | "textarea" | "multi-select";
  options?: { label: string; value: string | number }[]; // options.value também pode ser number
  onSave: (newValue: CellValue) => void;
  renderValue?: (value: CellValue) => React.ReactNode; 
  className?: string;
}

export function EditableCell({ 
  value, 
  isModified = false,
  type = "text", 
  options = [], 
  onSave, 
  renderValue,
  className = ""
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState<CellValue>(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(null);

  const [inputValue, setInputValue] = useState(""); 

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
    setInputValue("");
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  const addValue = (val: string | number) => {
    if (!val) return;
    const currentArray = Array.isArray(tempValue) ? tempValue : [];
    
    // Converte para string para garantir comparação se os tipos vierem misturados
    if (!currentArray.map(String).includes(String(val))) {
        // As asserções 'as' são necessárias aqui pois o TS não tem certeza 
        // qual array específico estamos manipulando
        setTempValue([...(currentArray as (string | number)[]), val] as CellValue);
    }
    setInputValue(""); 
  };

  const removeValue = (valToRemove: string | number) => {
    const currentArray = Array.isArray(tempValue) ? tempValue : [];
    setTempValue(currentArray.filter((v) => String(v) !== String(valToRemove)) as CellValue);
  };

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(inputValue.toLowerCase()) &&
    !(Array.isArray(tempValue) ? tempValue : []).map(String).includes(String(opt.value))
  );

  const exactMatch = options.find(opt => opt.label.toLowerCase() === inputValue.toLowerCase());

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
        {type === "multi-select" ? (
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1 mb-1 max-h-25 overflow-y-auto">
                    {Array.isArray(tempValue) && tempValue.length > 0 ? tempValue.map((val, idx) => {
                        const label = options.find(o => String(o.value) === String(val))?.label || String(val);
                        return (
                            <span key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-200 font-medium">
                                {label}
                                <button onMouseDown={(e) => {e.preventDefault(); removeValue(val as string | number)}} className="text-blue-400 hover:text-red-500">
                                    <X size={12} />
                                </button>
                            </span>
                        )
                    }) : <span className="text-gray-400 text-xs italic p-1">Nenhuma selecionada</span>}
                </div>

                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Buscar ou criar nova..."
                        className="w-full p-2 text-sm border rounded bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (exactMatch) {
                                    addValue(exactMatch.value);
                                } else if (inputValue.trim().length > 0) {
                                    addValue(inputValue.trim()); 
                                }
                            }
                        }}
                    />

                    {(inputValue.length > 0 || filteredOptions.length > 0) && (
                         <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-37.5 overflow-y-auto z-10">
                            
                            {filteredOptions.map(opt => (
                                <div 
                                    key={opt.value}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                                    onMouseDown={(e) => { e.preventDefault(); addValue(opt.value); }}
                                >
                                    {opt.label}
                                </div>
                            ))}

                            {inputValue.trim().length > 0 && !exactMatch && (
                                <div 
                                    className="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm text-green-700 flex items-center gap-2 border-t"
                                    onMouseDown={(e) => { e.preventDefault(); addValue(inputValue.trim()); }}
                                >
                                    <Plus size={14}/> Criar &quot;<strong>{inputValue}</strong>&quot;
                                </div>
                            )}
                            
                            {filteredOptions.length === 0 && inputValue.length === 0 && (
                                <div className="px-3 py-2 text-xs text-gray-400">Comece a digitar...</div>
                            )}
                         </div>
                    )}
                </div>
            </div>
        ) : type === "select" ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>} // Corrigido a Ref
            value={tempValue as string | number}
            onChange={(e) => setTempValue(e.target.value)}
            className="p-1 border rounded text-sm w-full min-w-25 bg-white text-black"
            onBlur={handleSave}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>} // Corrigido a Ref
            value={tempValue as string}
            onChange={(e) => setTempValue(e.target.value)}
            className="p-1 border rounded text-sm w-full min-w-50 bg-white text-black"
            rows={2}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>} // Corrigido a Ref
            type={type}
            value={tempValue as string | number}
            onChange={(e) => setTempValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="p-1 border rounded text-sm w-full min-w-20 bg-white text-black"
          />
        )}
        
        <div className="flex gap-1">
          <button onClick={handleSave} className="text-green-600 hover:text-green-800"><Check size={16} /></button>
          <button onClick={handleCancel} className="text-red-500 hover:text-red-700"><X size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group flex items-center justify-between gap-2 cursor-pointer min-h-7.5 pr-2 rounded hover:bg-gray-100 -ml-2 pl-2 ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <div className="truncate flex-1">
        {renderValue ? renderValue(value) : (value as string | number)}
      </div>
      {isModified ? (
         <div className="bg-yellow-200 p-1 rounded-full text-yellow-700" title="Alteração pendente">
            <Pencil size={10} strokeWidth={3} />
         </div>
      ) : (
        <Pencil 
            size={14} 
            className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
        />
      )}
    </div>
  );
}