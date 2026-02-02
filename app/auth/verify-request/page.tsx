"use client"
import Link from "next/link";
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function emailSendedScreen(){
    const searchParams = useSearchParams();

    const email = searchParams.get("email");
    const hasEmailError = searchParams.get("emailError") === "true";

    const [status, setStatus] = useState(hasEmailError ? "error" : email ? "success" : "missing")


    const handleResend = async () => {
        setStatus("loading");
        try{
            const res = await fetch("/api/auth/resend", { 
                method: "POST",
                body: JSON.stringify({ email })
            })
            
            if (res.ok) {
                setStatus("success")
            } else {
                setStatus("error")
            }
        }catch (error) {
            setStatus("error")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
            <div className="absolute top-8 left-12 text-xl font-serif">(LOGO)</div>
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                <h1 className="text-3xl font-serif mb-6 text-center text-black leading-tight">
                Um link de verificação foi enviado para seu e-mail.
            </h1>
            <h2 className="text-2xl font-serif mb-6 text-center text-black leading-tight">
                Verifique o seu e-mail para poder fazer login.
            </h2>

            {status === "error" && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    Houve um erro ao enviar o e-mail. Por favor, tente novamente.
                </div>
            )}

            {status === "success" && (
                <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                    E-mail enviado com sucesso! Verifique sua caixa de entrada e spam.
                </div>
            )}

            {status === "missing" && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    Sem parâmetro de e-mail.
                </div>
            )}

            <div className="flex justify-center mt-8">
                <button 
                onClick={handleResend}
                disabled={status === "loading"}
                className="btn-primary">
                    {status === "loading" ? "Enviando..." : "Reenviar E-mail"}
                </button>
            </div>

            <div className="flex items-center justify-center w-full max-w-xl mb-2 mt-8">
                <div className="flex-grow h-px bg-gray-400"></div> 
                
                <span className="px-3 text-gray-500 text-sm font-serif">E-mail verificado? Faça login!</span>
                
                <div className="flex-grow h-px bg-gray-400"></div>
            </div>

            <div className="flex justify-center mt-8">
                <Link 
                    href="/auth/login" 
                    className="btn-tertiary flex items-center gap-2" 
                >
                    Ir para login
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.5a.75.75 0 010 1.08l-5.5 5.5a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
            </div>
        </div>
    )
}
