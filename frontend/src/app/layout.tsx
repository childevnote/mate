import Providers from "@/components/Providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <title>Mate - 대학생을 위한 커뮤니티</title>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
