import { getUserPaymentMethods } from "@/app/actions/paymentMethods";
import { getAuthenticatedUser } from "@/app/lib/get-user";
import { redirect } from "next/navigation";
import MethodsListWrapper from "./CardsListWrapper";

export default async function PaymenthMethodsPage() {
    const authUser = await getAuthenticatedUser();
    if (!authUser) redirect('/auth/login');

    const methods = await getUserPaymentMethods();

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <MethodsListWrapper initialMethods={methods}></MethodsListWrapper>
        </div>
    )
}