import type { Metadata } from "next";
import "./globals.css";

// 🌟 先ほど作ったHeaderコンポーネントを読み込む
import Header from "./Component/Header/Header";

export const metadata: Metadata = {
  title: "PM LEAGUE | 競技麻雀リーグ",
  description: "PMリーグ 公式ポータルサイト",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-[#050505] text-white font-sans selection:bg-yellow-500 selection:text-black">
        
        {/* 🌟 長かったコードの代わりに、コンポーネントを1行置くだけ！ */}
        <Header />

        {/* ヘッダーが固定される分、メインコンテンツを下げる */}
        <div className="pt-24 sm:pt-20">
          {children}
        </div>

        {/* =========================================
            重厚感のあるフッター
            ========================================= */}
        <footer className="bg-black border-t border-white/10 mt-32 py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center border border-white/10 mb-6">
              <span className="text-[10px] text-gray-600">LOGO</span>
            </div>
            <p className="text-xs text-gray-500 tracking-widest">
              © 2026 PM LEAGUE. All Rights Reserved.
            </p>
          </div>
        </footer>

      </body>
    </html>
  );
}