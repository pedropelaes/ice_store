"use client"

import React, { useState } from "react"

interface PasswordInputsProps {
  passwordValue: string;
  confirmPasswordValue: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  passwordsMatchError?: boolean;
  layout?: "row" | "column";
}

export default function PasswordInputs({
  passwordValue,
  confirmPasswordValue,
  onChange,
  passwordsMatchError = false,
  layout = "row"
}: PasswordInputsProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputClassName = (isError: boolean) => `
      w-full p-3 rounded-xl outline-none transition-all border-2
      ${isError 
          ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] focus:shadow-[0_0_20px_rgba(239,68,68,0.6)] text-red-900" 
          : "input-custom w-full pr-10"
      }
  `;

  const containerClass = layout === "row" ? "flex gap-4 w-full" : "flex flex-col gap-4 w-full";
  const fieldClass = layout === "row" ? "flex flex-col w-1/2 relative" : "flex flex-col w-full relative";

  return (
    <div className={containerClass}>
      <div className={fieldClass}>
        <label className="mb-1 font-medium text-black">Senha *</label>
        <div className="relative">
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            value={passwordValue} 
            placeholder="Digite sua senha" 
            onChange={onChange} 
            className={inputClassName(passwordsMatchError)} 
            required 
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          >
            {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
            )}
          </button>
        </div>
      </div>

      <div className={fieldClass}>
        <label className="mb-1 font-medium text-black">Confirmar Senha *</label>
        <div className="relative">
          <input 
            name="confirmPassword" 
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPasswordValue} 
            placeholder="Confirme sua senha" 
            onChange={onChange} 
            className={inputClassName(passwordsMatchError)}
            required 
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
          >
            {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}