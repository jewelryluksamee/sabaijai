"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase-client";
import { useQuiz } from "@/lib/quiz-context";

const SCORE_LABELS = ["ไม่เลย", "บางวัน", "ค่อนข้างบ่อย", "เกือบทุกวัน"] as const;

const CATEGORIES = [
  {
    id: "anxiety",
    label: "ความเครียดและความกังวล",
    labelEn: "Stress / Anxiety",
    icon: "psychology",
    color: "#7c6fe0",
    bg: "#ede9ff",
    questions: [
      "รู้สึกว่าความคิดหรือความกังวลต่างๆ รบกวนจิตใจมากกว่าปกติ",
      "รู้สึกผ่อนคลายได้ยาก แม้ในช่วงเวลาที่ควรได้พัก",
      "รู้สึกว่ามีหลายเรื่องที่สร้างความกดดันในเวลาเดียวกัน",
      "มีความกังวลเกี่ยวกับเรื่องต่างๆ จนยากต่อการปล่อยวาง",
    ],
  },
  {
    id: "burnout",
    label: "ภาวะหมดไฟ",
    labelEn: "Burnout",
    icon: "local_fire_department",
    color: "#e07c3a",
    bg: "#fff0e5",
    questions: [
      "รู้สึกเหนื่อยล้าจากภาระหน้าที่หรือกิจวัตรประจำวัน",
      "รู้สึกขาดพลังงานหรือแรงจูงใจในการเริ่มต้นสิ่งต่างๆ",
      "กิจกรรมหรือสิ่งที่เคยสนใจ ไม่สร้างความรู้สึกเชิงบวกเหมือนเดิม",
      "แม้ได้พักผ่อนแล้ว แต่ยังรู้สึกไม่สดชื่นหรือฟื้นตัวได้ไม่เต็มที่",
    ],
  },
  {
    id: "depression",
    label: "ความเศร้าและหมดกำลังใจ",
    labelEn: "Depression",
    icon: "sentiment_very_dissatisfied",
    color: "#4e7cac",
    bg: "#e5f0ff",
    questions: [
      "รู้สึกเศร้า ว่างเปล่า หรือหมดกำลังใจบ่อยครั้ง",
      "รู้สึกว่าความสุขหรือความสบายใจลดลงจากเดิม",
      "รู้สึกเหนื่อยล้าทางอารมณ์ได้ง่ายกว่าปกติ",
      "รู้สึกไม่มั่นใจหรือเห็นคุณค่าในตนเองลดลง",
    ],
  },
  {
    id: "sleep",
    label: "ปัญหาการนอน",
    labelEn: "Sleep",
    icon: "bedtime",
    color: "#5a8a70",
    bg: "#e5f5ec",
    questions: [
      "มีปัญหาในการเริ่มต้นนอนหลับหรือหลับยาก",
      "ตื่นระหว่างคืนหรือพักผ่อนได้ไม่ต่อเนื่อง",
      "แม้นอนหลับแล้ว แต่ยังรู้สึกอ่อนล้าหรือพักผ่อนไม่เพียงพอ",
      "รู้สึกกังวลเกี่ยวกับคุณภาพการนอนของตนเอง",
    ],
  },
  {
    id: "focus",
    label: "สมาธิและการโฟกัส",
    labelEn: "Focus / ADHD-like",
    icon: "center_focus_strong",
    color: "#c0983a",
    bg: "#fff8e5",
    questions: [
      "รู้สึกว่าสมาธิลดลงหรือเสียสมาธิได้ง่าย",
      "มีปัญหาในการจัดการหลายสิ่งพร้อมกัน",
      "รู้สึกว่าการเริ่มต้นทำงานหรือภารกิจต่างๆ เป็นเรื่องยาก",
      "รู้สึกว่าความคิดในหัวทำงานต่อเนื่องจนยากต่อการจดจ่อ",
    ],
  },
  {
    id: "loneliness",
    label: "ความโดดเดี่ยวและคุณค่าในตนเอง",
    labelEn: "Loneliness / Self-worth",
    icon: "person_off",
    color: "#9a5a8a",
    bg: "#f5e5f5",
    questions: [
      "รู้สึกโดดเดี่ยว แม้อยู่ร่วมกับผู้อื่น",
      "เปรียบเทียบตนเองกับผู้อื่นแล้วรู้สึกด้อยกว่า",
      "มักเก็บความรู้สึกหรือปัญหาไว้กับตนเอง",
      "รู้สึกต้องการการเข้าใจหรือการสนับสนุนทางความรู้สึกจากผู้อื่นมากขึ้น",
    ],
  },
  {
    id: "trauma",
    label: "บาดแผลทางใจ",
    labelEn: "Trauma",
    icon: "healing",
    color: "#7a5a40",
    bg: "#f5ede5",
    questions: [
      "มีประสบการณ์หรือความทรงจำบางอย่างที่ยังส่งผลต่อความรู้สึกในปัจจุบัน",
      "พยายามหลีกเลี่ยงบางสถานการณ์หรือเรื่องราวที่ทำให้รู้สึกไม่สบายใจ",
      "รู้สึกระมัดระวัง ตึงเครียด หรือตกใจได้ง่ายกว่าปกติ",
      "รู้สึกว่าประสบการณ์ในอดีตยังส่งผลต่อสภาพจิตใจหรือการใช้ชีวิตในปัจจุบัน",
    ],
  },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];
type Answers = Partial<Record<`${CategoryId}_${0 | 1 | 2 | 3}`, number>>;

function getLevel(score: number): { label: string; color: string; bg: string } {
  if (score <= 3) return { label: "ระดับต่ำ", color: "#4e7c5f", bg: "#e5f5ec" };
  if (score <= 7) return { label: "ระดับปานกลาง", color: "#c0983a", bg: "#fff8e5" };
  return { label: "ระดับสูง", color: "#c00000", bg: "#fff0f0" };
}

type Step = "intro" | number | "result";

export default function MentalHealthQuiz() {
  const { setQuizOpen } = useQuiz();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Answers>({});

  const currentCatIndex = typeof step === "number" ? step : 0;
  const currentCat = CATEGORIES[currentCatIndex];

  function getCatScore(catIndex: number): number {
    const cat = CATEGORIES[catIndex];
    return [0, 1, 2, 3].reduce((sum, qi) => {
      const key = `${cat.id}_${qi}` as keyof Answers;
      return sum + (answers[key] ?? 0);
    }, 0);
  }

  function isCatComplete(catIndex: number): boolean {
    const cat = CATEGORIES[catIndex];
    return [0, 1, 2, 3].every((qi) => {
      const key = `${cat.id}_${qi}` as keyof Answers;
      return answers[key] !== undefined;
    });
  }

  function handleOpen() {
    setStep("intro");
    setAnswers({});
    setOpen(true);
    setQuizOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setQuizOpen(false);
  }

  async function handleFinish() {
    const user = auth.currentUser;
    if (user) {
      const scores: Record<string, number> = {};
      CATEGORIES.forEach((cat, i) => { scores[cat.id] = getCatScore(i); });
      try {
        await addDoc(collection(db, "quizResults", user.uid, "entries"), {
          takenAt: serverTimestamp(),
          scores,
        });
      } catch {
        // non-blocking
      }
    }
    handleClose();
  }

  function handleAnswer(catIndex: number, qIndex: number, score: number) {
    const cat = CATEGORIES[catIndex];
    const key = `${cat.id}_${qIndex}` as keyof Answers;
    setAnswers((prev) => ({ ...prev, [key]: score }));
  }

  function handleNext() {
    if (step === "intro") {
      setStep(0);
    } else if (typeof step === "number") {
      if (step < CATEGORIES.length - 1) {
        setStep(step + 1);
      } else {
        setStep("result");
      }
    }
  }

  function handlePrev() {
    if (typeof step === "number" && step > 0) {
      setStep(step - 1);
    } else if (typeof step === "number" && step === 0) {
      setStep("intro");
    } else if (step === "result") {
      setStep(CATEGORIES.length - 1);
    }
  }

  const progress =
    step === "intro"
      ? 0
      : step === "result"
      ? 100
      : Math.round(((currentCatIndex + 1) / CATEGORIES.length) * 100);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-black bg-white text-[#332b1f] font-semibold text-sm shadow-sm hover:bg-[#f5f0e8] active:scale-95 transition-all"
      >
        ทำแบบทดสอบสุขภาพใจ
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-20 sm:pb-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Sheet */}
          <div className="relative z-10 w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden border border-black">
            {/* Progress bar */}
            <div className="h-1 bg-[#e5e5e5] w-full flex-shrink-0">
              <div
                className="h-full bg-[#4e7c5f] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5] flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#332b1f] text-sm">
                  แบบทดสอบสุขภาพใจเบื้องต้น
                </span>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f5f0e8] transition-colors"
              >
                <span className="material-symbols-outlined text-[#9a8b7a]" style={{ fontSize: "20px" }}>
                  close
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-5 py-6">
              {/* Intro */}
              {step === "intro" && (
                <div className="space-y-5">
                  <div className="text-center space-y-3">
                    <h2 className="text-xl font-bold text-[#332b1f]" style={{ fontFamily: "var(--font-display)" }}>
                      คุณไม่จำเป็นต้องฝืนให้ตัวเอง &ldquo;โอเค&rdquo; ตลอดเวลา
                    </h2>
                    <p className="text-sm text-[#6b5e4d] leading-relaxed">
                      แบบสำรวจนี้เป็นพื้นที่เล็กๆ ให้คุณได้ลองเช็กความรู้สึกของตัวเองอย่างอ่อนโยน
                    </p>
                  </div>

                  <div className="bg-[#fff8e5] rounded-xl p-4 border border-[#e5d48a] text-sm text-[#6b5044] leading-relaxed space-y-1">
                    <p className="font-semibold text-[#8a6a20]">Disclaimer</p>
                    <p>
                      แบบประเมินนี้เป็นเพียงการคัดกรองสุขภาพจิตเบื้องต้น ไม่สามารถใช้วินิจฉัยโรคได้
                      หากมีอาการต่อเนื่องหรือส่งผลต่อการใช้ชีวิต ควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพจิต
                    </p>
                  </div>

                  <div className="bg-[#f5f0e8] rounded-xl p-4 border border-black text-sm text-[#6b5e4d] leading-relaxed">
                    <p className="font-semibold text-[#332b1f] mb-2">วิธีตอบ</p>
                    <p className="mb-3">กรุณาเลือกตอบโดยอิงจากความรู้สึกใน <span className="font-bold">2–4 สัปดาห์ที่ผ่านมา</span></p>
                    <div className="grid grid-cols-2 gap-2">
                      {SCORE_LABELS.map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-white border border-black text-[10px] font-bold text-[#332b1f] flex items-center justify-center shrink-0">
                            {i}
                          </span>
                          <span className="text-xs">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg text-center"
                        style={{ backgroundColor: cat.bg }}
                      >
                        <span
                          className="material-symbols-outlined text-lg"
                          style={{ color: cat.color, fontVariationSettings: "'FILL' 1" }}
                        >
                          {cat.icon}
                        </span>
                        <span className="text-[9px] font-medium leading-tight" style={{ color: cat.color }}>
                          {cat.labelEn}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category questions */}
              {typeof step === "number" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-black shrink-0"
                      style={{ backgroundColor: currentCat.bg }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ color: currentCat.color, fontVariationSettings: "'FILL' 1" }}
                      >
                        {currentCat.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#9a8b7a]">
                        หมวด {currentCatIndex + 1} / {CATEGORIES.length}
                      </p>
                      <h3 className="text-base font-bold text-[#332b1f]">
                        {currentCat.label}
                      </h3>
                      <p className="text-xs text-[#9a8b7a]">{currentCat.labelEn}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentCat.questions.map((question, qi) => {
                      const key = `${currentCat.id}_${qi}` as keyof Answers;
                      const selected = answers[key];
                      return (
                        <div key={qi} className="space-y-2">
                          <p className="text-sm text-[#332b1f] leading-relaxed">
                            <span className="font-bold text-[#9a8b7a] mr-1">{qi + 1}.</span>
                            {question}
                          </p>
                          <div className="grid grid-cols-4 gap-2">
                            {SCORE_LABELS.map((label, score) => (
                              <button
                                key={score}
                                onClick={() => handleAnswer(currentCatIndex, qi, score)}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all active:scale-95 text-center"
                                style={{
                                  borderColor: selected === score ? currentCat.color : "#e5e5e5",
                                  backgroundColor: selected === score ? currentCat.bg : "#fafafa",
                                }}
                              >
                                <span
                                  className="text-base font-bold"
                                  style={{ color: selected === score ? currentCat.color : "#9a8b7a" }}
                                >
                                  {score}
                                </span>
                                <span
                                  className="text-[9px] leading-tight"
                                  style={{ color: selected === score ? currentCat.color : "#9a8b7a" }}
                                >
                                  {label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Result */}
              {step === "result" && (
                <div className="space-y-5">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-[#e5f5ec] border border-black flex items-center justify-center mx-auto">
                      <span
                        className="material-symbols-outlined text-2xl text-[#4e7c5f]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-[#332b1f]" style={{ fontFamily: "var(--font-display)" }}>
                      ผลการประเมินสุขภาพใจ
                    </h2>
                    <p className="text-xs text-[#9a8b7a]">อิงจากคำตอบของคุณในช่วง 2–4 สัปดาห์ที่ผ่านมา</p>
                  </div>

                  <div className="space-y-3">
                    {CATEGORIES.map((cat, i) => {
                      const score = getCatScore(i);
                      const level = getLevel(score);
                      return (
                        <div
                          key={cat.id}
                          className="rounded-xl p-4 border border-black flex items-center gap-4"
                          style={{ backgroundColor: cat.bg }}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-black bg-white"
                          >
                            <span
                              className="material-symbols-outlined text-base"
                              style={{ color: cat.color, fontVariationSettings: "'FILL' 1" }}
                            >
                              {cat.icon}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#332b1f] truncate">{cat.label}</p>
                            <div className="mt-1 h-2 rounded-full bg-black/10 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.round((score / 12) * 100)}%`,
                                  backgroundColor: cat.color,
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold" style={{ color: cat.color }}>
                              {score}<span className="text-xs text-[#9a8b7a] font-normal">/12</span>
                            </p>
                            <span
                              className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                              style={{ color: level.color, backgroundColor: level.bg, borderColor: level.color + "40" }}
                            >
                              {level.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-[#f5f0e8] rounded-xl p-4 border border-black text-sm text-[#6b5e4d] leading-relaxed space-y-2">
                    <div className="flex gap-3">
                      {[
                        { label: "ต่ำ (0–3)", color: "#4e7c5f", bg: "#e5f5ec" },
                        { label: "ปานกลาง (4–7)", color: "#c0983a", bg: "#fff8e5" },
                        { label: "สูง (8–12)", color: "#c00000", bg: "#fff0f0" },
                      ].map((l) => (
                        <div key={l.label} className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: l.color }}
                          />
                          <span className="text-[10px] font-medium" style={{ color: l.color }}>{l.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#9a8b7a]">
                      แบบประเมินนี้ไม่สามารถใช้วินิจฉัยโรคได้ หากคะแนนสูงในหลายหมวดหรือมีอาการต่อเนื่อง
                      ควรปรึกษาผู้เชี่ยวชาญด้านสุขภาพจิต หรือโทร <span className="font-bold">1323</span> (กรมสุขภาพจิต)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="px-5 py-4 border-t border-[#e5e5e5] flex gap-3 flex-shrink-0">
              {step !== "intro" && step !== "result" && (
                <button
                  onClick={handlePrev}
                  className="flex-1 py-3 rounded-xl border border-black text-sm font-semibold text-[#6b5e4d] bg-white hover:bg-[#f5f0e8] active:scale-95 transition-all"
                >
                  ← ย้อนกลับ
                </button>
              )}
              {step === "result" ? (
                <button
                  onClick={handleFinish}
                  className="flex-1 py-3 rounded-xl border border-black text-sm font-semibold text-white active:scale-95 transition-all"
                  style={{ background: "linear-gradient(135deg, #4e7c5f, #6ba880)" }}
                >
                  เสร็จสิ้น
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={typeof step === "number" && !isCatComplete(step)}
                  className="flex-1 py-3 rounded-xl border border-black text-sm font-semibold text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #4e7c5f, #6ba880)" }}
                >
                  {step === "intro"
                    ? "เริ่มทำแบบทดสอบ →"
                    : typeof step === "number" && step < CATEGORIES.length - 1
                    ? "ถัดไป →"
                    : "ดูผลลัพธ์ →"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
