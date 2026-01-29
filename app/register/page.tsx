"use client"

import React, { SyntheticEvent, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function signUpPage(){
    const router = useRouter()

    const [formData, setFormData] = useState({ // estados para formularios
        name: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        cpf: "",
        birthDate: "",
    })

    const [error, setError] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault()
        setError("")

        try{
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    birthDate: new Date(formData.birthDate).toISOString()
                })
            })

            if(!res.ok){
                const data = await res.json()
                throw new Error(data.error || "Erro ao criar conta")
            }

            const loginRes = await signIn("credentials", {
                redirect: false,
                email: formData.email.trim(),
                password: formData.password
            })

            if(loginRes?.error){
                setError("Conta criada, mas erro ao logar automaticamente.")
            }else{
                router.push("/")
                router.refresh()
            }

        }catch(err: any){
            setError(err.message)
        }
    }

    return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-4">Criar Conta</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <input 
          name="name" 
          placeholder="Nome" 
          onChange={handleChange} 
          className="border p-2 rounded text" 
          required 
        />
        <input 
          name="lastName" 
          placeholder="Sobrenome" 
          onChange={handleChange} 
          className="border p-2 rounded text" 
          required 
        />
        <input 
          name="cpf" 
          placeholder="CPF" 
          onChange={handleChange} 
          className="border p-2 rounded text" 
          required 
        />
        <input 
          name="birthDate" 
          type="date" 
          onChange={handleChange} 
          className="border p-2 rounded text" 
          required 
        />
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          onChange={handleChange} 
          className="border p-2 rounded text" 
          required 
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Senha" 
          onChange={handleChange} 
          className="border p-2 rounded text" 
          required 
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Confirme sua senha" 
          onChange={handleChange} 
          className="border p-2 rounded text" 
          required 
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
          type="submit" 
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Cadastrar e Entrar
        </button>
      </form>
    </div>
  )
}