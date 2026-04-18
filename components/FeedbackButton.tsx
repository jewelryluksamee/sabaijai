"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { submitFeedback } from "@/app/actions";

const CATEGORIES = [
  { value: "bug", label: "พบปัญหา", icon: "bug_report" },
  { value: "feature", label: "ขอฟีเจอร์", icon: "lightbulb" },
  { value: "compliment", label: "ชื่นชม", icon: "favorite" },
  { value: "other", label: "อื่น ๆ", icon: "chat_bubble" },
];

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setRating(0);
    setHovered(0);
    setCategory("");
    setMessage("");
    setDone(false);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(reset, 300);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitFeedback(fd);
      if (res.ok) setDone(true);
    });
  }

  return (
    <>
      {/* Navbar trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="ให้ feedback"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/30 text-white/80 hover:bg-white/10 active:scale-95 transition-all cursor-pointer text-sm font-medium"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>rate_review</span>
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Modal — portalled to document.body to escape header's stacking context */}
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Modal */}
          <div
            className="bg-white w-full max-w-md rounded-2xl border border-black shadow-[0_8px_40px_rgba(0,0,0,0.18)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0e9d8]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#6f624e]" style={{ fontSize: "20px" }}>rate_review</span>
                <span className="[font-family:var(--font-display)] font-bold text-[#332b1f]">ให้ความคิดเห็น</span>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#9a8b7a] hover:bg-[#f5eed8] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
              </button>
            </div>

            {done ? (
              /* Success state */
              <div className="flex flex-col items-center gap-4 py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#4caf50]" style={{ fontSize: "36px" }}>check_circle</span>
                </div>
                <p className="[font-family:var(--font-display)] text-lg font-bold text-[#332b1f]">ขอบคุณสำหรับ Feedback </p>
                <p className="text-sm text-[#9a8b7a]">ความคิดเห็นของคุณจะช่วยพัฒนา sabaijai ให้ดีขึ้น </p>
                <button
                  onClick={handleClose}
                  className="mt-2 px-6 py-2.5 rounded-full bg-[#332b1f] text-white text-sm font-semibold cursor-pointer active:scale-95 transition-transform"
                >
                  ปิด
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                {/* Star rating */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#6f624e]">คุณพอใจกับ sabaijai แค่ไหน?</label>
                  <input type="hidden" name="rating" value={rating} />
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(star)}
                        className="cursor-pointer transition-transform active:scale-90"
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: "32px",
                            color: (hovered || rating) >= star ? "#f59e0b" : "#d4c9b8",
                            fontVariationSettings: (hovered || rating) >= star ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#6f624e]">ประเภท</label>
                  <input type="hidden" name="category" value={category} />
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCategory(c.value)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer"
                        style={
                          category === c.value
                            ? { borderColor: "#332b1f", backgroundColor: "#332b1f", color: "#fff" }
                            : { borderColor: "#e0d8cc", backgroundColor: "#faf8f4", color: "#6f624e" }
                        }
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>{c.icon}</span>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#6f624e]">
                    รายละเอียด <span className="font-normal text-[#9a8b7a]">(ไม่บังคับ)</span>
                  </label>
                  <textarea
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="บอกเราได้เลยนะ..."
                    className="w-full rounded-xl border border-[#e0d8cc] bg-[#faf8f4] px-4 py-3 text-sm text-[#332b1f] placeholder:text-[#c4b9aa] resize-none focus:outline-none focus:border-[#9a8b7a] transition-colors"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-3 rounded-xl border border-[#e0d8cc] bg-[#faf8f4] text-[#6f624e] font-semibold text-sm active:scale-95 transition-all cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={!rating || !category || isPending}
                    className="flex-1 py-3 rounded-xl bg-[#332b1f] text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
                  >
                    {isPending ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
