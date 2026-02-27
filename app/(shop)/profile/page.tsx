import { UserOptionButton } from "@/app/components/store/user/UserOptionButton";
import { getAuthenticatedUser } from "@/app/lib/get-user"
import { Briefcase, CreditCard, Notebook, Trash2, User } from "lucide-react";
import { redirect } from "next/navigation";

export default async function UserOptionsPage(){
    const authUser = await getAuthenticatedUser();
    if(!authUser) redirect('/auth/login');

    return (
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    
                    <UserOptionButton 
                        href="/profile/orders" 
                        label="Meus pedidos" 
                        icon={Briefcase} 
                    />
                    
                    <UserOptionButton 
                        href="/profile/addresses" 
                        label="Meus endereços" 
                        icon={Notebook} 
                    />
                    
                    <UserOptionButton 
                        href="/profile/cards" 
                        label="Meus cartões" 
                        icon={CreditCard} 
                    />
                    
                    <UserOptionButton 
                        href="/profile/data" 
                        label="Meus dados" 
                        icon={User} 
                    />
                    
                    <UserOptionButton 
                        href="/profile/delete" 
                        label="Apagar minha conta" 
                        icon={Trash2} 
                        variant="danger" 
                    />
                    
                </div>
            </div>
    )
}