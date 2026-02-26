import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user;
}