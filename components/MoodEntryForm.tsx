"use client";

import { useRef, useState } from "react";
import { submitPost, type MoodColor } from "@/app/actions";

// Placeholder responses — swap out when API is ready
const AI_RESPONSES = [
  "เรารับรู้ถึงความเหนื่อยล้าของคุณนะ การใจดีกับตัวเองบ้างก็เป็นเรื่องที่สำคัญพอๆ กับการใจดีกับคนอื่นเลย วันนี้คุณเก่งมากแล้วที่ผ่านมันมาได้ พักผ่อนให้เต็มที่นะ",
  "ขอบคุณที่เล่าให้ฟังนะ ความรู้สึกของคุณมีความหมายเสมอ ไม่ว่าจะดีหรือไม่ดี แค่ได้ระบายออกมาก็ช่วยได้มากเลย",
  "วันนี้อาจจะหนักหน่อย แต่คุณมาถึงตรงนี้ได้แล้ว นั่นคือความกล้าหาญอย่างหนึ่งนะ อยู่เคียงข้างคุณเสมอ",
  "ทุกความรู้สึกล้วนมีเหตุผล อย่าโกรธตัวเองที่รู้สึกแบบนี้นะ ให้เวลาตัวเองบ้าง แล้วทุกอย่างจะค่อยๆ ดีขึ้นเอง",
  "ได้ยินคุณอยู่นะ บางวันแค่ลุกขึ้นมาก็เป็นความสำเร็จแล้ว คุณทำได้ดีมากเลย",
];

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
];

export default function MoodEntryForm() {
  const [selectedMood, setSelectedMood] = useState<MoodColor | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    if (!selectedMood) return;
    formData.set("mood", selectedMood);
    setPending(true);
    await submitPost(formData);
    window.dispatchEvent(new CustomEvent("newPost"));
    setPending(false);
    setSelectedMood(null);
    formRef.current?.reset();

    // Signal feed card to start listening, then reveal response
    window.dispatchEvent(new CustomEvent("aiListening"));
    await new Promise((r) => setTimeout(r, 1200));
    const text = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
    window.dispatchEvent(new CustomEvent("aiResponse", { detail: { text } }));
  }

  return (
    <form ref={formRef} action={handleSubmit}>
      <div className="flex flex-col gap-5">

        {/* Colour picker */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-[#4e7c5f]/60 uppercase tracking-wider">
            วันนี้รู้สึกเป็นสีอะไร?
          </label>

          <div className="flex flex-wrap gap-2.5">
            {moods.map(({ value, hex }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedMood(value === selectedMood ? null : value)}
                className="w-7 h-7 rounded-full shrink-0 transition-all duration-200"
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
          <label className="text-sm font-semibold text-[#4e7c5f]/60 uppercase tracking-wider">
            บอกความในใจ
          </label>
          <textarea
            name="content"
            rows={3}
            required
            className="w-full bg-[#e8dfc6] rounded-lg px-5 py-4 border-none outline-none focus:ring-2 focus:ring-[#4e7c5f]/20 text-[#332b1f] placeholder:text-[#c8baa8] resize-none transition-all"
            placeholder="วันนี้เจอเรื่องอะไรมาบ้าง..."
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-[#e8dfc6]">
          <button
            type="submit"
            disabled={pending || !selectedMood}
            className="px-8 py-3 bg-linear-to-r from-[#4e7c5f] to-[#3d6b4e] text-[#f4faf6] rounded-full font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pending ? "กำลังส่ง..." : "ส่งขึ้นสู่ดวงดาว"}
          </button>
        </div>
      </div>
    </form>
  );
}
