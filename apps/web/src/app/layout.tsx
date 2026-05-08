import type { Metadata } from "next";
import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import "@/globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Mate",
    default: "Mate - 대학생 익명 커뮤니티", 
  },
  
  description: "대학생들을 위한 올인원 커뮤니티 Mate입니다. 질문, 스터디 모집, 전공 서적 거래, 그리고 익명 수다까지 함께해요.",
  keywords: ["대학생", "신입생", "커뮤니티", "스터디", "정보", "질문", "Mate"],

  openGraph: {
    title: "Mate - 대학생 익명 커뮤니티",
    description: "대학 생활 혼자 보내기 외롭다면? Mate에서 동료를 만나보세요.",
    type: "website",
    siteName: "Mate",
    locale: "ko_KR",
    url: "https://main.d3tpdfp23uq4rz.amplifyapp.com/",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </Providers>
      </body>
    </html>
  );
}