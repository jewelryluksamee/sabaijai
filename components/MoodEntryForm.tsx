"use client";

import { useRef, useState } from "react";
import { submitPost, type MoodColor } from "@/app/actions";

const moods: { value: MoodColor; cls: string }[] = [
  { value: "yellow", cls: "bg-yellow-400/20 border-yellow-400 ring-yellow-400" },
  { value: "blue", cls: "bg-blue-400/20 border-blue-400 ring-blue-400" },
  { value: "red", cls: "bg-red-400/20 border-red-400 ring-red-400" },
  { value: "purple", cls: "bg-purple-400/20 border-purple-400 ring-purple-400" },
  { value: "green", cls: "bg-green-400/20 border-green-400 ring-green-400" },
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
    setPending(false);
    setSelectedMood(null);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#69558e]/60 uppercase tracking-wider">
            บอกความในใจของคุณ
          </label>
          <textarea
            name="content"
            required
            className="w-full bg-[#ede6eb] rounded-lg p-6 min-h-[120px] border-none outline-none focus:ring-2 focus:ring-[#69558e]/20 text-[#353136] placeholder:text-[#b6b0b6]"
            placeholder="วันนี้เจอเรื่องอะไรมาบ้าง..."
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-[#69558e]/60 uppercase tracking-wider">
            เลือกสีตามอารมณ์ของคุณ
          </label>
          <div className="flex flex-wrap gap-4">
            {moods.map(({ value, cls }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedMood(value)}
                className={`w-12 h-12 rounded-full border-2 ring-offset-2 ring-2 transition-all ${cls} ${
                  selectedMood === value ? "ring-2 scale-110" : "ring-transparent"
                }`}
              />
            ))}
          </div>
          {!selectedMood && (
            <p className="text-xs text-[#b6b0b6]">กรุณาเลือกอารมณ์ก่อนส่ง</p>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-[#ede6eb]">
          <button
            type="submit"
            disabled={pending || !selectedMood}
            className="px-8 py-3 bg-gradient-to-r from-[#69558e] to-[#5c4981] text-[#fef7ff] rounded-full font-semibold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "กำลังส่ง..." : "ส่งขึ้นสู่ดวงดาว"}
          </button>
        </div>
      </div>
    </form>
  );
}
