"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase-client";

export default function GoogleSignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error("Session creation failed");

      router.push("/home");
    } catch (err) {
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-14 bg-white border border-[#b6b0b6]/20 rounded-xl flex items-center justify-center space-x-3 hover:bg-[#fef8fb] transition-all duration-300 group shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="w-5 h-5 border-2 border-[#69558e]/30 border-t-[#69558e] rounded-full animate-spin" />
        ) : (
          <span className="text-xl font-bold text-[#4285F4]">G</span>
        )}
        <span className="font-medium text-[#353136]">
          {loading ? "กำลังเข้าสู่ระบบ..." : "ดำเนินการต่อด้วย Google"}
        </span>
      </button>
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
