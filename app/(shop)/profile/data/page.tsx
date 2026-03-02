import { getAuthenticatedUser } from "@/app/lib/get-user";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import UserDataWrapper from "./UserDataWrapper";

export default async function UserDataPage() {
  const authUser = await getAuthenticatedUser();
  if (!authUser) redirect('/auth/login');

  const user = await prisma.user.findUnique({
    where: { email: authUser.email },
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      cpf: true,
      birthDate: true,
    }
  });

  if (!user) redirect('/auth/login');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <UserDataWrapper initialData={user} />
    </div>
  );
}