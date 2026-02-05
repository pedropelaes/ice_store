"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/login" })} 
      className="btn-tertiary"
    >
        <LogOut></LogOut>
        Sair do Sistema
    </button>
  );
}