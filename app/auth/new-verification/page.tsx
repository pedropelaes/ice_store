"use client"
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export default function verifyPage(){
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const onSubmit = useCallback(async () => {
        if (success || error) return;

        if(!token){
            setError("Token não encontrado.");
            return;
        }

        try{
            const res = await fetch("/api/auth/verify-token", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Algo deu errado.");
            } else {
                setSuccess(data.success);
            }
        }catch(err){
            setError("Erro de conexão ao verificar e-mail.");
        }
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">
            <div className="absolute top-8 left-12 text-xl font-serif">(LOGO)</div>
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
                <h1 className="text-3xl font-serif mb-6">Verificando seu e-mail</h1>

                {!success && !error && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p>Validando token...</p>
                </div>
                )}

                {success && (
                <div className="bg-green-100 text-green-700 p-3 rounded mb-6">
                    <p>{success}</p>
                </div>
                )}

                {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-6">
                    <p>{error}</p>
                </div>
                )}

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