"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/");
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-[#69558e]/10 text-[#69558e] hover:opacity-80 transition-opacity"
      title="ออกจากระบบ"
    >
      <span className="material-symbols-outlined text-sm">logout</span>
    </button>
  );
}
