"use client"

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteUserAccount } from "@/app/actions/deleteUser";
import { signOut } from "next-auth/react";

export function DeleteAccountForm({ userId }: { userId: number }) {
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!password) {
            setErrorMsg("A senha é obrigatória para confirmar a exclusão.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await deleteUserAccount(userId, password);

            if (!response.success) {
                setErrorMsg(response.error || "Senha incorreta ou erro ao excluir.");
            }else{
                await signOut({callbackUrl: '/'})
            }
        } catch (error) {
            console.log("Erro ao deletar conta: ", error)
            setErrorMsg("Falha de comunicação com o servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white border border-red-200 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
                <div className="bg-red-100 p-3 rounded-full shrink-0">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-red-600 mb-2">
                        Exclusão Permanente
                    </h2>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Ao excluir sua conta, todos os seus dados pessoais, endereços e métodos de pagamento salvos serão apagados permanentemente. O histórico de pedidos será retido apenas para fins fiscais, mas desvinculado de você. <strong>Esta ação não pode ser desfeita.</strong>
                    </p>
                </div>
            </div>

            <form onSubmit={handleDelete} className="mt-8 border-t border-gray-100 pt-6">
                <div className="max-w-md">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                        Digite sua senha para confirmar
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha de acesso"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                        disabled={isLoading}
                    />
                    
                    {errorMsg && (
                        <p className="mt-2 text-sm text-red-600 font-medium">
                            {errorMsg}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !password}
                        className="mt-6 px-6 py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center min-w-37.5"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" /> Processando...
                            </span>
                        ) : (
                            "Apagar Minha Conta"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}