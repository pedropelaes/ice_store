"use client"

import React, { SyntheticEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { cpf as cpfValidator } from "cpf-cnpj-validator"
import { z } from "zod"
import { capitalizeWords, formatCPF, formatEmail, formatLettersOnly, formatNumbersOnly } from "../../lib/formaters/formaters"
import Link from "next/link"
import PasswordInputs from "@/app/components/PasswordInputs"

export default function SignUpPage(){
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [equalPasswords, setEqualPasswords] = useState(false);

    const [formData, setFormData] = useState({ // estados para formularios
        name: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        cpf: "",
        birthDay: "",
        birthMonth: "",
        birthYear: "",
    })

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false);

    /*const capitalizeFirstLetter = (value: string) => {
      return value.charAt(0).toUpperCase() + value.slice(1);
    };*/


    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue = value;

        if (!newValue) return;

        if (name === "birthDay" || name === "birthMonth") {
            newValue = newValue.padStart(2, '0');
        } 
        else if (name === "birthYear") {
            newValue = newValue.padStart(4, '0');
        }

        setFormData((prev) => ({ ...prev, [name]: newValue }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue = value;
        setError("");

        if(name === "name" || name === "lastName"){
          newValue = formatLettersOnly(value);
          newValue = capitalizeWords(newValue);
        }
        else if(name === "birthDay" || name === "birthMonth"){
          newValue = formatNumbersOnly(value).slice(0, 2);
        }else if(name === "birthYear"){
          newValue = formatNumbersOnly(value).slice(0, 4);
        }
        else if(name === "cpf"){
          newValue = formatCPF(value);
        }
        else if(name === "email"){
          newValue = formatEmail(value);
        }else if(name === "password" || name === "confirmPassword"){
          const currentPassword = name === "password" ? newValue : formData.password;
          const currentConfirm = name === "confirmPassword" ? newValue : formData.confirmPassword;

          if (currentConfirm && currentPassword !== currentConfirm) {
                setEqualPasswords(true); 
                setError("As senhas não coincidem.");
            } else {
                setEqualPasswords(false);
                setError("");
            }
        }

        setFormData({
            ...formData,
            [name]: newValue
        })
    }

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault()
        setError("")

        const day = parseInt(formData.birthDay);
        const month = parseInt(formData.birthMonth);
        const year = parseInt(formData.birthYear);
        const currentYear = new Date().getFullYear();
        const email = formData.email;
        const password = formData.password;
        const confirmPassword = formData.confirmPassword;

        if(!cpfValidator.isValid(formData.cpf)) {
            setError("Por favor, insira um CPF/CNPJ válido");
            return;
        }

        if (year < 1900 || year > currentYear) {
            setError("Por favor, insira um ano de nascimento válido.");
            return; 
        }

        if (month < 1 || month > 12 || day < 1 || day > 31) {
             setError("Data de nascimento inválida.");
             return;
        }

        const emailSchema = z.string().email();
        const emailValidation = emailSchema.safeParse(email);

        if(!emailValidation.success){
          setError("Por favor, insira um e-mail válido.")
          return;
        }

        if(password !== confirmPassword){
          setError("As senhas devem ser iguais.")
          return;
        }
        
        if(password.length < 6){
          setError("A senha deve ter no mínimo 6 caracteres.")
          return;
        }

        const hasLetterRegex = /[a-zA-Z]/;
        if (!hasLetterRegex.test(password)) {
            setError("A senha deve conter pelo menos 1 letra.");
            return;
        }

        const fullDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
        setLoading(true);
        try{
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    birthDate: new Date(fullDate).toISOString()
                })
            })

            const signupData = await res.json()

            if(!res.ok){
                const data = await res.json()
                setLoading(false);
                throw new Error(data.error || "Erro ao criar conta")
            }

            const params = new URLSearchParams();

            params.set("email", formData.email);

            if(signupData.emailSended === "false"){
              params.set("emailError", "true");
            }
            
            router.push(`/auth/verify-request?${params.toString()}`)
            router.refresh()
            

        }catch(err: unknown){
          setLoading(false);
          const errorMessage = err instanceof Error ? err.message : String(err);
          console.log(err);
          if(errorMessage === "Email exists"){
            setError("Já existe um usuário cadastrado com esse e-mail.");
          }else if(errorMessage === "CPF exists"){
            setError("Já existe um usuário cadastrado com esse CPF/CNPJ.");
          }else{
            console.log(errorMessage);
            setError("Erro inesperado. Tente novamente. Caso persista, contate nosso suporte.")
          }
        }
    }

    const handleContinue = (e: React.MouseEvent) => {
      e.preventDefault();

      if(!formData.name || !formData.cpf || !formData.lastName || !formData.birthDay || !formData.birthMonth || !formData.birthYear){
        setError("Por favor, preencha todos os dados pessoas.")
        return;
      }

      if(error) return;

      setError("");
      setStep(2);
    }

    return (
      
    <div className="flex flex-row min-h-screen w-full">
      <div className="w-2/3 flex flex-col p-12 bg-white relative">

        <div className="absolute top-8 left-12 text-xl font-serif">(LOGO)</div>


        <div className="mt-24 flex flex-col items-center">
            {step === 1 ? (
                <h1 className="text-4xl font-serif mb-12 text-center text-black leading-tight">
                    Crie sua conta para se tornar<br /> membro de nossa loja!
                </h1>
            ) : (
                <h1 className="text-4xl font-serif mb-12 text-center text-black leading-tight">
                    Só mais essas informações!
                </h1>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-xl">
              
              {step === 1 && (
                <>
                  <div className="flex gap-4">
                    <div className="flex flex-col w-1/2">
                      <label className="mb-1 font-medium text-black">Nome *</label>
                      <input name="name" value = {formData.name} placeholder="Digite seu nome" onChange={handleChange} className="input-custom" required />
                    </div>
                    <div className="flex flex-col w-1/2">
                      <label className="mb-1 font-medium text-black">Sobrenome *</label>
                      <input name="lastName" value = {formData.lastName} placeholder="Digite seu sobrenome" onChange={handleChange} className="input-custom" required />
                    </div>
                  </div>

                  <div className="flex flex-col">
                      <label className="mb-1 font-medium text-black">CPF/CNPJ *</label>
                      <input name="cpf" value = {formData.cpf} placeholder="111.222.333-50" onChange={handleChange} className="input-custom" required />
                  </div>

                  <div className="flex flex-col">
                      <label className="mb-1 font-medium text-black ">Data de nascimento *</label>
                      <div className="flex gap-4">
                          <div className="flex flex-col w-1/4">
                            <label className="mb-1 text-sm text-black ">Dia *</label>
                            <input name="birthDay" value = {formData.birthDay} placeholder="05" 
                            onChange={handleChange} onBlur={handleBlur} className="input-custom" required />
                          </div>
                          <div className="flex flex-col w-1/4">
                            <label className="mb-1 text-sm text-black ">Mês *</label>
                            <input name="birthMonth" value = {formData.birthMonth} placeholder="12" 
                            onChange={handleChange} onBlur={handleBlur}  className="input-custom" required />
                          </div>
                          <div className="flex flex-col grow">
                            <label className="mb-1 text-sm text-black ">Ano *</label>
                            <input name="birthYear" value = {formData.birthYear} placeholder="2000" 
                            onChange={handleChange} onBlur={handleBlur} className="input-custom" required />
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-center mt-8">
                    <button onClick={handleContinue} className="btn-primary">
                      Continuar
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.5a.75.75 0 010 1.08l-5.5 5.5a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="flex flex-col">
                      <label className="mb-1 font-medium text-black">E-mail *</label>
                      <input name="email" type="email" value = {formData.email} placeholder="exemplo@gmail.com" onChange={handleChange} className="input-custom" required />
                  </div>

                  <PasswordInputs 
                    passwordValue={formData.password}
                    confirmPasswordValue={formData.confirmPassword}
                    onChange={handleChange}
                    passwordsMatchError={equalPasswords}
                    layout="row" // Lado a lado para a página de cadastro
                  />

                  <div className="flex gap-4 justify-center mt-8">
                    <button 
                      type="button" 
                      onClick={() => {setStep(1); setError("")}} 
                      className="btn-tertiary"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5" viewBox="0 0 32 32"><path d="M32 15H3.41l8.29-8.29-1.41-1.42-10 10a1 1 0 0 0 0 1.41l10 10 1.41-1.41L3.41 17H32z" data-name="4-Arrow Left"/></svg>
                      Voltar
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>
                </div>
                </>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}

            </form>
        </div>
      </div>

      <div className="w-1/3 flex flex-col justify-center items-center bg-[#9CA3AF] text-white p-12 text-center">
        <h2 className="text-3xl font-bold mb-4" >Já possui uma conta?</h2>
        <h3 className="mb-8">Faça login e aproveite nossa loja!</h3>

        <Link 
          href="/auth/login"
          className="btn-secondary"
        >
          Entrar
        </Link>
      </div>
    </div>
  )
}