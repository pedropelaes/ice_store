"use client"

import React, { SyntheticEvent, useState, Suspense } from "react";
import PasswordInputs from "@/app/components/PasswordInputs";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token"); 

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        const currentPassword = name === "password" ? value : password;
        const currentConfirm = name === "confirmPassword" ? value : passwordConfirm;

        if (name === "password") {
            setPassword(value);
        } else {
            setPasswordConfirm(value);
        }

        if (currentConfirm.length > 0 && currentPassword !== currentConfirm) {
            setError("As senhas não coincidem.");
        }else if(password.length < 6){
            setError("A senha deve ter no mínimo 6 caracteres.")
        }
         else {
            setError(""); 
        }
    }

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Link de recuperação inválido ou ausente. Por favor, solicite um novo e-mail.");
            return;
        }

        if (password !== passwordConfirm) {
            setError("As senhas não coincidem.");
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        const hasLetterRegex = /[a-zA-Z]/;
        if (!hasLetterRegex.test(password)) {
            setError("A senha deve conter pelo menos 1 letra.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao redefinir a senha.");
            }

            setSuccess(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const passwordsMatchError = passwordConfirm.length > 0 && password !== passwordConfirm;

    if (success) {
        return (
            <div className="flex flex-col items-center text-center gap-6 w-full max-w-xl mt-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </div>
                <h2 className="text-2xl font-serif text-black">Senha alterada com sucesso!</h2>
                <p className="text-gray-600">Sua senha foi atualizada. Você já pode fazer login e acessar a loja.</p>
                <button 
                    onClick={() => router.push("/auth/login")} 
                    className="btn-primary mt-4"
                >
                    Ir para o Login
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-xl">
            <PasswordInputs
                passwordValue={password}
                confirmPasswordValue={passwordConfirm}
                onChange={handleChange}
                passwordsMatchError={passwordsMatchError}
                layout="column"
            />

            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

            <div className="flex justify-center mt-4">
                <button 
                    type="submit" 
                    disabled={loading || password.length === 0 || passwordConfirm.length === 0 || passwordsMatchError}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Salvando nova senha..." : "Redefinir Senha"}
                </button>
            </div>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white w-full">
            <div className="absolute top-8 left-12 text-xl font-serif">(LOGO)</div>

            <div className="mt-24 flex flex-col items-center p-12">
                <h1 className="text-4xl font-serif mb-6 text-center text-black leading-tight">
                    Crie sua nova senha
                </h1>
                
                <p className="text-gray-500 mb-8 text-center max-w-md">
                    Digite uma nova senha abaixo para acessar sua conta. Certifique-se de escolher uma senha forte e segura.
                </p>

                {/* Suspense é necessário no Next.js ao usar useSearchParams */}
                <Suspense fallback={<div className="text-gray-500">Carregando formulário...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}