"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ステップ2で作ったAPIにデータを送る
    const res = await fetch("/api/Register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name, password }),
    });

    if (res.ok) {
      alert("アカウント登録が完了しました！ログインしてください。");
      router.push("/Login"); // 成功したらログイン画面へ移動
    } else {
      const data = await res.json();
      setError(data.error || "登録に失敗しました");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="bg-zinc-900 p-8 rounded-lg border border-yellow-600/30 w-full max-w-md shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-yellow-500 tracking-wider">
          監督アカウント登録
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 text-sm p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">お名前（表示名）</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2 focus:outline-none focus:border-yellow-600 transition-colors"
              placeholder="例: 麻雀 太郎"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">ログインID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2 focus:outline-none focus:border-yellow-600 transition-colors"
              placeholder="半角英数字"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2 focus:outline-none focus:border-yellow-600 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-zinc-950 font-bold py-2 px-4 rounded transition-colors mt-6"
          >
            登録する
          </button>
        </form>
      </div>
    </div>
  );
}