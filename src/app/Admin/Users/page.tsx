import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function UsersAdminPage() {
  // 1. ログイン情報を取得
  const session = await auth();

  // 🌟【最重要セキュリティ】
  // ログインしていない、または権限が「ADMIN（サイト管理者）」ではない場合、
  // ページを表示せずにトップページへ強制リダイレクト（追い出す）
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/"); 
  }

  // 管理者しかここから下のコードは実行されないので安全に全ユーザー情報を取得
  const allUsers = await prisma.user.findMany({
    include: { team: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white font-sans pt-32">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 border-b border-red-500/30 pb-4">
          <h1 className="text-3xl font-black italic tracking-wider text-red-500">
            SYSTEM <span className="text-white">ADMINISTRATION</span>
          </h1>
          <p className="text-gray-500 text-xs mt-2 tracking-widest uppercase font-bold">
            サイト管理者専用：ユーザー管理ダッシュボード
          </p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1a1a] border-b border-white/10 text-xs text-gray-400 tracking-widest uppercase">
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">User Name</th>
                <th className="p-4 font-bold">Login ID</th>
                <th className="p-4 font-bold">Team</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-1 tracking-widest uppercase ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{u.name}</td>
                  <td className="p-4 text-gray-400 font-mono text-sm">{u.userId}</td>
                  <td className="p-4 text-sm">{u.team?.name || <span className="text-gray-600">- 未所属 -</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}