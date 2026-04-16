"use client";

import { useRef, useState } from "react";
import { submitPost, type MoodColor } from "@/app/actions";

const moods: { value: MoodColor; hex: string }[] = [
  { value: "red",    hex: "#e85d4a" },
  { value: "orange", hex: "#f0883a" },
  { value: "yellow", hex: "#f0c832" },
  { value: "lime",   hex: "#7ed040" },
  { value: "green",  hex: "#38b86a" },
  { value: "teal",   hex: "#20b8a8" },
  { value: "cyan",   hex: "#20a8d8" },
  { value: "blue",   hex: "#3880e8" },
  { value: "indigo", hex: "#5858d8" },
  { value: "purple", hex: "#9048d0" },
  { value: "pink",   hex: "#e050a0" },
  { value: "gray",   hex: "#909090" },
  { value: "black",  hex: "#332b1f" },
  { value: "white",  hex: "#f8f8f8" }
];

export default function MoodEntryForm() {
  const [selectedMood, setSelectedMood] = useState<MoodColor | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmittingRef = useRef(false);

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmittingRef.current || !selectedMood) return;

    isSubmittingRef.current = true;
    setPending(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("mood", selectedMood);

      window.dispatchEvent(new CustomEvent("aiListening"));
      const { aiText } = await submitPost(formData);
      window.dispatchEvent(new CustomEvent("newPost"));
      
      setSelectedMood(null);
      formRef.current?.reset();

      const text = aiText || "ขอบคุณที่เล่าให้ฟังนะ อยู่เคียงข้างคุณเสมอเลย 🌟";
      window.dispatchEvent(new CustomEvent("aiResponse", { detail: { text } }));
    } finally {
      isSubmittingRef.current = false;
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleFormSubmit}>
      <div className="flex flex-col gap-5">

        {/* Colour picker */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-black uppercase tracking-wider">
            วันนี้คุณรู้สึกเป็นสีอะไร?
          </label>

          <div className="flex flex-wrap gap-2.5 mt-2 ">
            {moods.map(({ value, hex }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedMood(value === selectedMood ? null : value)}
                className="w-7 h-7 rounded-full shrink-0 border border-black transition-all duration-200"
                style={{
                  backgroundColor: hex,
                  opacity: selectedMood && selectedMood !== value ? 0.3 : 1,
                  transform: selectedMood === value ? "scale(1.25)" : "scale(1)",
                  boxShadow:
                    selectedMood === value
                      ? `0 0 0 2px #fdf8ef, 0 0 0 3.5px ${hex}`
                      : "none",
                }}
              />
            ))}
          </div>
        </div>

        {/* Optional text */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-black uppercase tracking-wider">
            บอกความในใจ
          </label>
          <textarea
            name="content"
            rows={3}
            required
            className="w-full mt-2 bg-[#e8dfc6] rounded-lg px-5 py-4 border border-black outline-none focus:ring-2 focus:ring-[#4e7c5f]/20 text-[#332b1f] placeholder:text-[#c8baa8] resize-none transition-all"
            placeholder="วันนี้เจอเรื่องอะไรมาบ้าง..."
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-[#e8dfc6]">
          <button
            type="submit"
            disabled={pending || !selectedMood}
            className="px-8 py-4 mt-2 bg-linear-to-r from-[#7c5cbf] to-[#6b4aad] text-white rounded-full border border-black font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pending ? "กำลังส่ง..." : "แชร์ความรู้สึก"}
          </button>
        </div>
      </div>
    </form>
  );
}
