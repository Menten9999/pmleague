import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PM LEAGUE",
  description: "PMリーグ 管理ポータル",
  // 検索避けの設定
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      {/* <html> と <body> があるのが大元のレイアウトの絶対条件です！ */}
      <body className="bg-[#050505] text-white">
        {children}
      </body>
    </html>
  );
}