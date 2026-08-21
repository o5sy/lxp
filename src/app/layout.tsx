import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono, Nanum_Gothic_Coding } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-voice",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["500"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-chrome",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const nanumGothicCoding = Nanum_Gothic_Coding({
  variable: "--font-option",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "AI 맞춤 실습 생성기",
  description:
    "방금 배운 개념을 골라 개인화된 코딩 실습을 받고, 같은 화면에서 실행하고 피드백을 받습니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} ${nanumGothicCoding.variable} h-full antialiased`}
    >
      <body className="font-body flex min-h-full flex-col">{children}</body>
    </html>
  );
}
