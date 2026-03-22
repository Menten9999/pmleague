"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function ArchiveAdminPage() {
  const [title, setTitle] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 誤操作防止：タイトルが入力されていて、かつ確認文字が一致しているか
  const isReadyToArchive = title.trim() !== '' && confirmText === 'ARCHIVE';

  const handleArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReadyToArchive) return;

    if (!window.confirm(`本当に「${title}」としてシーズンを終了し、現在のスコアをすべてリセットしますか？この操作は取り消せません！`)) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'シーズンのアーカイブとスコアのリセットが完了しました！' });
        setTitle('');
        setConfirmText('');
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '通信エラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white font-sans flex flex-col items-center">
      <div className="w-full max-w-2xl mt-10">
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-red-500">
              SEASON ARCHIVE
            </h1>
            <p className="text-gray-500 text-xs mt-1 tracking-[0.2em] uppercase font-bold">
              シーズン終了と成績の保存（危険操作）
            </p>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">
            トップへ戻る
          </Link>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded-sm border ${message.type === 'error' ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-green-900/50 border-green-500 text-green-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleArchive} className="bg-[#111] border border-red-900/50 p-8 rounded-sm shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900"></div>

          <div className="bg-red-950/30 border border-red-900/50 p-4 mb-8 rounded-sm text-sm text-red-200 leading-relaxed">
            <span className="font-bold text-red-500">⚠️ 警告：</span><br />
            この操作を実行すると、現在の「全チーム・全選手のスコア」と「試合結果」がすべてリセットされ、新シーズンに向けた初期状態（0pt）に戻ります。現在の成績は「過去のシーズン」として永久保存されます。
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block mb-2">保存するシーズン名 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-red-500"
                placeholder="例: PMリーグ 2026 Spring"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block mb-2">確認入力 <span className="text-red-500">*</span></label>
              <p className="text-xs text-gray-500 mb-2">操作を確定するために、下の入力欄に半角大文字で <strong>ARCHIVE</strong> と入力してください。</p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-red-500"
                placeholder="ARCHIVE"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isReadyToArchive || isLoading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black italic py-4 transition-all tracking-widest mt-8"
          >
            {isLoading ? "PROCESSING..." : "シーズンを終了し成績をアーカイブする"}
          </button>
        </form>
      </div>
    </main>
  );
}