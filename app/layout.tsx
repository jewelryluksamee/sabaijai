import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro, Itim, Mali, Dancing_Script, Mitr } from "next/font/google";
import "./globals.css";
import { MusicProvider } from "@/components/MusicProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["400", "600", "700", "800"],
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
});

const itim = Itim({
  subsets: ["latin", "thai"],
  variable: "--font-handwriting",
  weight: "400",
});

const mali = Mali({
  subsets: ["latin", "thai"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  weight: ["400", "600", "700"],
});

const mitr = Mitr({
  subsets: ["latin", "thai"],
  variable: "--font-mitr",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sabaijai - พื้นที่ปลอดภัย ให้ใจได้พัก",
  description: "Your Safe Space",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${mali.className} ${plusJakartaSans.variable} ${beVietnamPro.variable} ${itim.variable} ${mali.variable} ${dancingScript.variable} ${mitr.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className={`${mali.className} bg-[#fdf8ef] text-[#332b1f] antialiased min-h-screen`}>
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}
