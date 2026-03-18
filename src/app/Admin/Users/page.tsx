"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type User = {
  id: string;
  userId: string;
  name: string;
  role: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // パスワードリセット用の状態管理
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // 画面を開いた時にユーザー一覧を取得
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' }); // ← , { cache: 'no-store' } を追加！
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("ユーザー取得エラー", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // パスワードリセット処理
  const handlePasswordReset = async (id: string) => {
    if (!window.confirm("このユーザーのパスワードを強制的に上書きします。よろしいですか？")) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newPassword }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'パスワードをリセットしました！' });
        setResettingUserId(null); // 入力枠を閉じる
        setNewPassword('');
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '通信エラーが発生しました' });
    }
  };

  // ユーザー削除処理
  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`本当に「${name}」のアカウントを削除しますか？この操作は取り消せません。`)) return;

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'アカウントを削除しました。' });
        fetchUsers(); // 一覧を最新化
      } else {
        setMessage({ type: 'error', text: '削除に失敗しました' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '通信エラーが発生しました' });
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white font-sans flex flex-col items-center">
      <div className="w-full max-w-4xl mt-10">
        
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-yellow-500">
              USER MANAGEMENT
            </h1>
            <p className="text-gray-500 text-xs mt-1 tracking-[0.2em] uppercase font-bold">
              監督アカウント管理
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

        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-[#111] border border-white/10 p-6 rounded-sm shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              
              {/* ユーザー情報 */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-yellow-900/50 text-yellow-500 border border-yellow-700 text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-widest uppercase">
                    {user.role}
                  </span>
                  <span className="text-sm text-gray-400 font-mono">ID: {user.userId}</span>
                </div>
                <h2 className="text-xl font-bold tracking-wider">{user.name}</h2>
              </div>

              {/* 操作ボタンエリア */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                
                {/* パスワードリセットの入力枠（ボタンを押した時だけ表示） */}
                {resettingUserId === user.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="新しいパスワード"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-black border border-yellow-600/50 p-2 text-white text-sm focus:outline-none focus:border-yellow-500 w-full md:w-48"
                    />
                    <button
                      onClick={() => handlePasswordReset(user.id)}
                      className="bg-yellow-600 hover:bg-yellow-500 text-black text-xs font-bold py-2 px-3 rounded-sm whitespace-nowrap"
                    >
                      確定
                    </button>
                    <button
                      onClick={() => setResettingUserId(null)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-2 px-3 rounded-sm whitespace-nowrap"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setResettingUserId(user.id);
                      setNewPassword('');
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 px-4 rounded-sm transition-colors border border-white/10"
                  >
                    パスワード再設定
                  </button>
                )}

                {/* 削除ボタン */}
                {resettingUserId !== user.id && (
                  <button
                    onClick={() => handleDeleteUser(user.id, user.name)}
                    className="bg-red-900/30 hover:bg-red-900 text-red-500 hover:text-red-200 text-xs font-bold py-2 px-4 rounded-sm transition-colors border border-red-900 ml-0 md:ml-2"
                  >
                    削除
                  </button>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center text-gray-500 py-10 font-bold tracking-widest text-sm bg-[#111] border border-white/10 rounded-sm">
              ユーザーが見つかりません
            </div>
          )}
        </div>
      </div>
    </main>
  );
}