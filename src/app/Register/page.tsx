"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function RegisterPage() {
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [teamName, setTeamName] = useState(''); // 🌟 チーム名用ステート
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch("/api/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🌟 teamName も一緒に送信する
        body: JSON.stringify({ userId, name, password, inviteCode, teamName }),
      });

      if (res.ok) {
        router.push("/Login");
      } else {
        const data = await res.json();
        setError(data.error || "登録に失敗しました");
      }
    } catch (err) {
      setError("接続エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-4 sm:p-6 text-white font-sans pt-20">
      <div className="fixed inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
        <span className="text-[20vw] font-black italic">PM</span>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-yellow-500">MANAGER REGISTRATION</h1>
          <p className="text-[10px] md:text-xs text-gray-500 mt-2 tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold">新規チーム＆監督アカウント登録</p>
        </div>

        <div className="bg-[#111] border border-white/10 p-5 sm:p-8 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700"></div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {error && <div className="bg-red-900/50 border border-red-500 text-red-200 text-sm p-3 rounded-sm text-center font-bold tracking-widest">{error}</div>}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">招待コード (Invitation Code) <span className="text-red-500">*</span></label>
              <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white focus:border-yellow-500 transition-colors" placeholder="管理者から受け取ったコード" required />
            </div>

            {/* 🌟 チーム名の入力欄を追加 */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-yellow-500 tracking-widest uppercase">設立するチーム名 (Team Name) <span className="text-red-500">*</span></label>
              <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full bg-black border border-yellow-500/30 p-3 text-white focus:border-yellow-500 transition-colors" placeholder="例：麻雀ファイターズ" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">監督名 (Manager Name) <span className="text-red-500">*</span></label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white focus:border-yellow-500 transition-colors" placeholder="麻雀 太郎" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">ログインID (User ID) <span className="text-red-500">*</span></label>
              <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white focus:border-yellow-500 transition-colors" placeholder="半角英数字" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">パスワード (Password) <span className="text-red-500">*</span></label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-white/10 p-3 text-white focus:border-yellow-500 transition-colors" placeholder="••••••••" required />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-black italic py-4 transition-all tracking-widest mt-4">
              {isLoading ? "PROCESSING..." : "REGISTER"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
             <Link href="/Login" className="text-xs text-gray-500 hover:text-white transition-colors tracking-widest underline underline-offset-4">既にアカウントをお持ちの方はこちら</Link>
          </div>
        </div>
      </div>
    </main>
  );
}