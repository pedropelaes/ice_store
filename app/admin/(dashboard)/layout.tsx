import { getServerSession } from "next-auth";
import Sidebar from "../../components/admin/sidebar";
import { authOptions } from "../../lib/auth";
import { AdminClientLayout } from "@/app/components/admin/AdminClientLayout";

export default async function AdminLayout({
  children, 
}: {
  children: React.ReactNode;
}) {

    const session = await getServerSession(authOptions);
  return (
    <AdminClientLayout userName={session?.user?.name}>
        {children}
    </AdminClientLayout>
  );
}