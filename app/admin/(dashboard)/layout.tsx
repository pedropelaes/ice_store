import { getServerSession } from "next-auth";
import Sidebar from "../../components/admin/sidebar";
import { authOptions } from "../../lib/auth";

export default async function AdminLayout({
  children, 
}: {
  children: React.ReactNode;
}) {

    const session = await getServerSession(authOptions);
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#999999] text-2xl shadow p-4">
          Bem vindo, {session?.user.name}
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}