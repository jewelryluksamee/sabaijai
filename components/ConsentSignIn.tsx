"use client";

import { useState } from "react";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function ConsentSignIn() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-5">
      {/* Disclaimer box */}
      <div className="rounded-xl border border-[#e8c96a] bg-[#fffbea] px-4 py-3.5 text-center space-y-1.5">
        <p className="text-[13px] font-semibold text-[#7a5c00]">
          ⚠️ ข้อความสำคัญ ⚠️
        </p>
        <p className="text-[12px] text-[#8a6a10] leading-relaxed">
          <strong>sabaijai ไม่ใช่เว็บไซต์ทางการแพทย์</strong> และไม่ได้ให้คำปรึกษาด้านสุขภาพจิตแบบวิชาชีพ
          หากคุณกำลังประสบปัญหาด้านสุขภาพจิต โปรดติดต่อผู้เชี่ยวชาญ
          หรือสายด่วนสุขภาพจิต <strong>1323</strong>
        </p>
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <div className="w-5 h-5 rounded border-2 border-[#b8a898] bg-white peer-checked:bg-[#4e7c5f] peer-checked:border-[#4e7c5f] transition-all flex items-center justify-center">
            {agreed && (
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <p className="text-[12px] text-[#6b5e4d] leading-relaxed">
          ฉันเข้าใจว่า <strong>sabaijai</strong> เป็นพื้นที่สำหรับแบ่งปันความรู้สึกเพื่อความสบายใจ
          ไม่ใช่บริการทางการแพทย์ และต้องการใช้งานเว็บนี้
        </p>
      </label>

      {/* Sign in button — disabled until consent given */}
      <div className={agreed ? "" : "opacity-50 pointer-events-none"}>
        <GoogleSignIn />
      </div>

      {!agreed && (
        <p className="text-center text-[11px] text-[#b8a898]">
          กรุณาอ่านและยอมรับเงื่อนไขด้านบนก่อนเข้าสู่ระบบ
        </p>
      )}
    </div>
  );
}
