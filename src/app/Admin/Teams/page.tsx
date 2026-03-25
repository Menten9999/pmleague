"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Team = {
  id: string;
  name: string;
  color?: string | null;
  players: { id: string; name: string }[];
};

export default function TeamRegistrationPage() {
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('');
  // 最大5名まで入力できるように枠を用意
  const [playerNames, setPlayerNames] = useState(['', '', '', '', '']);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams', { cache: 'no-store' });
      const data = await res.json();
      setTeams(data);
    } catch (error) {
      console.error('チーム一覧取得エラー', error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handlePlayerNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          color: teamColor,
          playerNames: playerNames,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error });
      } else {
        setMessage({ type: 'success', text: 'チームと選手の登録が完了しました！' });
        // 成功したらフォームを空っぽにリセットする
        setTeamName('');
        setTeamColor('');
        setPlayerNames(['', '', '', '', '']);
        fetchTeams();
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
        
        {/* ヘッダー部分 */}
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-yellow-500">
              TEAM REGISTRATION
            </h1>
            <p className="text-gray-500 text-xs mt-1 tracking-[0.2em] uppercase font-bold">
              チームおよび所属選手登録
            </p>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors">
            トップへ戻る
          </Link>
        </div>

        {/* メッセージ表示エリア */}
        {message.text && (
          <div className={`p-4 mb-6 rounded-sm border ${message.type === 'error' ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-green-900/50 border-green-500 text-green-200'}`}>
            {message.text}
          </div>
        )}

        {/* 登録フォーム */}
        <div className="bg-[#111] border border-white/10 p-8 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700"></div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* チーム情報セクション */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-yellow-500 tracking-widest uppercase border-b border-white/10 pb-2">Team Info</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">チーム名 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="例: 渋谷ABEMAS"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">チームカラー</label>
                  <input
                    type="text"
                    value={teamColor}
                    onChange={(e) => setTeamColor(e.target.value)}
                    className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="例: ゴールド"
                  />
                </div>
              </div>
            </div>

            {/* 選手情報セクション */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-yellow-500 tracking-widest uppercase border-b border-white/10 pb-2">Players</h2>
              <p className="text-xs text-gray-500">※所属する選手名を入力してください（最大5名・空欄の枠は登録されません）</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playerNames.map((name, index) => (
                  <div key={index} className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">選手 {index + 1}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                      placeholder={`選手名`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-black italic py-4 transition-all tracking-widest mt-4"
            >
              {isLoading ? "SAVING..." : "チームと選手を登録する"}
            </button>
          </form>
        </div>

        <div className="mt-10 bg-[#111] border border-white/10 p-8 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700"></div>
          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-yellow-500 tracking-widest uppercase">Registered Teams</h2>
            <Link href="/Admin/Teams/Edit" className="text-xs text-gray-400 hover:text-yellow-500 transition-colors tracking-widest uppercase">
              一覧編集ページへ
            </Link>
          </div>

          {teams.length === 0 ? (
            <p className="text-sm text-gray-500">登録済みチームはまだありません。</p>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center justify-between bg-black/40 border border-white/10 p-3 rounded-sm">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: team.color || '#eab308' }}></span>
                      <p className="font-bold text-white truncate">{team.name}</p>
                    </div>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase mt-1">{team.players.length} players</p>
                  </div>
                  <Link
                    href={`/Admin/Teams/Edit?teamId=${team.id}`}
                    className="text-xs px-3 py-2 border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors tracking-widest uppercase"
                  >
                    編集
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}