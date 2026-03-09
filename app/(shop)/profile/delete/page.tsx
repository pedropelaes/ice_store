import { getAuthenticatedUser } from "@/app/lib/get-user";
import { redirect } from "next/navigation";
import { DeleteAccountForm } from "@/app/components/store/user/DeleteAccountForm";
import prisma from "@/app/lib/prisma"; 

export default async function DeleteAccountPage() {
    const authUser = await getAuthenticatedUser();
    if (!authUser) redirect('/auth/login');
    
    const user = await prisma.user.findUnique({
        where: { email: authUser.email },
        select: { id: true }
    });

    if (!user) redirect('/auth/login');

    return(
        <div className="max-w-4xl mx-auto px-4 py-8">
            <DeleteAccountForm />
        </div>
    )
}