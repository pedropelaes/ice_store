import { getAuthenticatedUser } from "@/app/lib/get-user";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProfileHeader } from "@/app/components/store/user/ProfileHeader";

export default async function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const authUser = await getAuthenticatedUser();

    if (!authUser) {
        redirect('/auth/login');
    }

    return (
        <div className="bg-white min-h-screen text-black pb-20">
            <ProfileHeader userName={authUser.name} />
            
            {children}
        </div>
    );
}