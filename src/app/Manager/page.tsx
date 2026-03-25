import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ManagerPage() {
  const session = await auth();

  // 🌟【セキュリティ】
  // ログインしていない、または「MANAGER（監督）」以外がアクセスしたらトップへ弾く
  if (!session?.user || (session.user as any).role !== "MANAGER") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white font-sans pt-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 border-b border-white/10 pb-4">
          <h1 className="text-3xl font-black italic tracking-wider text-yellow-500">
            MANAGER <span className="text-white">DASHBOARD</span>
          </h1>
          <p className="text-gray-500 text-xs mt-2 tracking-widest uppercase font-bold">
            マイチーム管理・選手登録（開発中）
          </p>
        </div>

        <div className="bg-[#111] border border-white/10 p-8 rounded-sm">
          <p className="text-gray-400 tracking-wider">
            ようこそ、監督！ここはあなたのチームの選手を登録したり、次の試合の出場メンバーを決定するための専用ダッシュボードになる予定です。
          </p>
        </div>
      </div>
    </main>
  );
}