export type EmotionCategory = "HAPPY" | "SAD" | "ANGRY" | "ANXIOUS" | "BURNOUT" | "NEUTRAL" | "CRITICAL_RISK";

export const emotionChartConfig: Record<EmotionCategory, { label: string; icon: string; color: string; chartColor: string }> = {
  HAPPY:         { label: "มีความสุข",            icon: "sentiment_very_satisfied",    color: "#c8960a", chartColor: "#f0c832" },
  SAD:           { label: "เศร้า",                 icon: "sentiment_sad",               color: "#3063b8", chartColor: "#3880e8" },
  ANGRY:         { label: "โกรธ",                  icon: "sentiment_very_dissatisfied", color: "#c03020", chartColor: "#e85d4a" },
  ANXIOUS:       { label: "กังวล",                 icon: "warning",                     color: "#b86010", chartColor: "#f0883a" },
  BURNOUT:       { label: "หมดแรง",                icon: "battery_0_bar",               color: "#703aa0", chartColor: "#9048d0" },
  NEUTRAL:       { label: "เฉยๆ",                  icon: "sentiment_neutral",           color: "#4a6b45", chartColor: "#4e7c5f" },
  CRITICAL_RISK: { label: "ต้องการความช่วยเหลือ", icon: "emergency",                   color: "#c00000", chartColor: "#e82828" },
};

export const emotionBadgeConfig: Record<EmotionCategory, { label: string; icon: string; bg: string; text: string; border: string }> = {
  HAPPY:         { label: "มีความสุข",            icon: "sentiment_very_satisfied",    bg: "rgba(240,200,50,0.15)",  text: "#c8960a", border: "rgba(240,200,50,0.5)" },
  SAD:           { label: "เศร้า",                 icon: "sentiment_sad",               bg: "rgba(56,128,232,0.12)",  text: "#3063b8", border: "rgba(56,128,232,0.4)" },
  ANGRY:         { label: "โกรธ",                  icon: "sentiment_very_dissatisfied", bg: "rgba(232,93,74,0.12)",  text: "#c03020", border: "rgba(232,93,74,0.4)" },
  ANXIOUS:       { label: "กังวล",                 icon: "warning",                     bg: "rgba(240,136,58,0.12)", text: "#b86010", border: "rgba(240,136,58,0.4)" },
  BURNOUT:       { label: "หมดแรง",                icon: "battery_0_bar",               bg: "rgba(144,72,208,0.12)", text: "#703aa0", border: "rgba(144,72,208,0.4)" },
  NEUTRAL:       { label: "เฉยๆ",                  icon: "sentiment_neutral",           bg: "rgba(144,144,144,0.12)",text: "#666666", border: "rgba(144,144,144,0.4)" },
  CRITICAL_RISK: { label: "ต้องการความช่วยเหลือ", icon: "emergency",                   bg: "rgba(232,40,40,0.12)",  text: "#c00000", border: "rgba(232,40,40,0.5)" },
};

export const moodColorMap: Record<string, { hex: string; thaiName: string; meaning: string; icon: string }> = {
  red:    { hex: "#e85d4a", thaiName: "แดง",        meaning: "ความมีพลังและความกล้าหาญ",       icon: "local_fire_department" },
  orange: { hex: "#f0883a", thaiName: "ส้ม",        meaning: "ความอบอุ่นและความสนุกสนาน",      icon: "wb_sunny" },
  yellow: { hex: "#f0c832", thaiName: "เหลือง",     meaning: "ความสดใสและความหวัง",             icon: "star" },
  lime:   { hex: "#7ed040", thaiName: "เขียวมะนาว", meaning: "ความสดชื่นและพลังงานใหม่",       icon: "eco" },
  green:  { hex: "#38b86a", thaiName: "เขียว",      meaning: "ความสงบและการเยียวยา",            icon: "spa" },
  teal:   { hex: "#20b8a8", thaiName: "เขียวอมฟ้า", meaning: "ความสมดุลและความชัดเจน",         icon: "water_drop" },
  cyan:   { hex: "#20a8d8", thaiName: "ฟ้าอมเขียว", meaning: "ความผ่อนคลายและอิสระ",           icon: "air" },
  blue:   { hex: "#3880e8", thaiName: "น้ำเงิน",    meaning: "ความสงบนิ่งและความน่าเชื่อถือ",  icon: "water" },
  indigo: { hex: "#5858d8", thaiName: "คราม",       meaning: "ความลึกซึ้งและสติปัญญา",         icon: "psychology" },
  purple: { hex: "#9048d0", thaiName: "ม่วง",       meaning: "ความสร้างสรรค์และจินตนาการ",     icon: "auto_awesome" },
  pink:   { hex: "#e050a0", thaiName: "ชมพู",       meaning: "ความรักและความอ่อนโยน",           icon: "favorite" },
  gray:   { hex: "#909090", thaiName: "เทา",        meaning: "ความสงบเงียบและการพักผ่อน",       icon: "cloud" },
  black:  { hex: "#332b1f", thaiName: "ดำ",         meaning: "ความลึกลับและความแข็งแกร่ง",      icon: "dark_mode" },
  white:  { hex: "#f8f8f8", thaiName: "ขาว",        meaning: "ความบริสุทธิ์และความสงบ",         icon: "light_mode" },
};

export const moodPalette: Record<string, { blob: string; dot: string }> = {
  red:    { blob: "rgba(232,93,74,0.18)",   dot: "#e85d4a" },
  orange: { blob: "rgba(240,136,58,0.18)",  dot: "#f0883a" },
  yellow: { blob: "rgba(240,200,50,0.18)",  dot: "#f0c832" },
  lime:   { blob: "rgba(126,208,64,0.18)",  dot: "#7ed040" },
  green:  { blob: "rgba(56,184,106,0.18)",  dot: "#38b86a" },
  teal:   { blob: "rgba(32,184,168,0.18)",  dot: "#20b8a8" },
  cyan:   { blob: "rgba(32,168,216,0.18)",  dot: "#20a8d8" },
  blue:   { blob: "rgba(56,128,232,0.18)",  dot: "#3880e8" },
  indigo: { blob: "rgba(88,88,216,0.18)",   dot: "#5858d8" },
  purple: { blob: "rgba(144,72,208,0.18)",  dot: "#9048d0" },
  pink:   { blob: "rgba(224,80,160,0.18)",  dot: "#e050a0" },
  gray:   { blob: "rgba(144,144,144,0.18)", dot: "#909090" },
  black:  { blob: "rgba(51,43,31,0.18)",   dot: "#332b1f" },
  white:  { blob: "rgba(232,223,198,0.35)", dot: "#c8baa8" },
};
