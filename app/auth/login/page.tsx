"use client"

import { SyntheticEvent, useState } from "react"
import { formatEmail } from "../../lib/formaters/formaters";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function loginPage(){
    const router = useRouter();
    const [formData, setFormData] = useState({ // estados para formularios
            email: "",
            password: "",
        })
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue = value;

        if(name === "email"){
          newValue = formatEmail(value);
        }else if(name === "password"){
            newValue = value;
        }

        setFormData({
            ...formData,
            [name]: newValue
        })
    }

    const ERROR_MESSAGES: Record<string, string> = {
        CredentialsSignin: "E-mail ou senha incorretos.",
        EMAIL_NOT_VERIFIED: "Confirme seu e-mail antes de entrar.",
    };

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try{
            const res = await signIn("credentials", {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if(res?.error){
                setError(ERROR_MESSAGES[res.error] ?? "Erro ao realizar login.");
                if(res.error === "EMAIL_NOT_VERIFIED"){
                    const res_resend = await fetch("/api/resend", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: formData.email
                        })
                    });

                    if(!res_resend.ok){
                        alert("Houve um erro ao enviar um e-mail de verificação, tente fazer login novamente.");
                    }else{
                        alert(`"Um novo e-mail de verificação foi enviado para: ${formData.email}`);
                    }
                }
                setLoading(false);
            }else{
                router.push(`/`);
                router.refresh();
            }
        }catch(error){
            setError("Erro inesperado. Tente novamente.");
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-row min-h-screen w-full">
            <div className="w-2/3 flex flex-col p-12 bg-white relative">
                <div className="absolute top-8 left-12 text-xl font-serif">(LOGO)</div>

                <div className="mt-24 flex flex-col items-center p-12">
                    <h1 className="text-4xl font-serif mb-6 text-center text-black leading-tight">
                        Entre em sua conta
                    </h1>
                    <h2 className="text-2xl font-serif mb-4 text-center text-gray-400 leading-tight">
                        Entre usando suas redes
                    </h2>

                    <div className="flex gap-4 justify-center mb-2">
                        <button className="w-14 h-14 bg-[#333] rounded-full flex items-center justify-center hover:bg-black transition-colors">
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-white">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                        </button>

                        <button className="w-14 h-14 bg-[#333] rounded-full flex items-center justify-center hover:bg-black transition-colors">
                            <svg viewBox="0 0 24 24" className="w-6 h-6">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </button>

                        <button className="w-14 h-14 bg-[#333] rounded-full flex items-center justify-center hover:bg-black transition-colors">
                            <svg viewBox="0 0 384 512" className="w-8 h-8 fill-white">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center w-full max-w-xl mb-2">
                        <div className="flex-grow h-px bg-gray-400"></div> 
                        
                        <span className="px-3 text-gray-500 text-sm font-serif">OU</span>
                        
                        <div className="flex-grow h-px bg-gray-400"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xl">
                        <div className="flex flex-col">
                            <label className="mb-1 font-medium text-black">E-mail *</label>
                            <input name="email" type="email" value = {formData.email} onChange={handleChange} placeholder="exemplo@gmail.com" 
                            className={`input-custom ${error ? "border-red-500" : ""}`} required />
                        </div>

                        <div className="flex flex-col relative">
                            <label className="mb-1 font-medium text-black">Senha *</label>
                            <div className="relative">
                                <input name="password" type={showPassword ? "text" : "password"} value={formData.password} 
                                placeholder="Digite sua senha" onChange={handleChange} className={`w-full p-3 rounded-xl outline-none transition-all border-2 input-custom w-full pr-10 ${error ? "border-red-500" : ""}`} required 
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

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4 justify-center mt-2">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Entrando..." : "Entrar"}
                            </button>
                        </div>
                    </form>
                </div>
                
            </div>

            <div className="w-1/3 flex flex-col justify-center items-center bg-[#9CA3AF] text-white p-12 text-center">
                <h2 className="text-3xl font-bold mb-4" >Ainda não possui conta?</h2>
                <h3 className="mb-8">Faça o seu cadastro para  aproveitar a nossa loja!</h3>

                <Link 
                href="/auth/register"
                className="btn-secondary"
                >
                Cadastrar
                </Link>
            </div>
        </div>
    )
}