import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro, Itim, Mali } from "next/font/google";
import "./globals.css";

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
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
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
      className={`${plusJakartaSans.variable} ${beVietnamPro.variable} ${itim.variable} ${mali.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-[#fdf8ef] text-[#332b1f] font-[var(--font-body)] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
