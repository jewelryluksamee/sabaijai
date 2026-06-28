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
      className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/75 backdrop-blur-md border border-white/60 shadow-[0_4px_24px_rgba(123,111,255,0.18)] text-[#7B6FFF] hover:bg-white/95 hover:scale-105 hover:shadow-[0_6px_28px_rgba(123,111,255,0.28)] active:scale-95 transition-all cursor-pointer"
      title="ออกจากระบบ"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>logout</span>
    </button>
  );
}
