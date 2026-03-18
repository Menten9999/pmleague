"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Player = { id: string; name: string };
type Team = { id: string; name: string; players: Player[] };

export default function SchedulePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matchTitle, setMatchTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 4人分の入力データ（上から順に東・南・西・北として扱います）
  const [results, setResults] = useState([
    { teamId: '', playerId: '' },
    { teamId: '', playerId: '' },
    { teamId: '', playerId: '' },
    { teamId: '', playerId: '' },
  ]);

  const winds = ["東家 (TON)", "南家 (NAN)", "西家 (XIA)", "北家 (PEI)"];

  useEffect(() => {
    fetch('/api/teams', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.error("チーム取得エラー", err));
  }, []);

  const handleResultChange = (index: number, field: string, value: string) => {
    const newResults = [...results];
    newResults[index] = { ...newResults[index], [field]: value };
    if (field === 'teamId') {
      newResults[index].playerId = ''; // チームが変わったら選手をリセット
    }
    setResults(newResults);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const isComplete = results.every(r => r.teamId && r.playerId);
    if (!isComplete) {
      setMessage({ type: 'error', text: '4家すべてのチームと選手を選択してください。' });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/matches/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: matchTitle, results }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '次回予告（NEXT MATCH）を登録しました！' });
        setResults(results.map(() => ({ teamId: '', playerId: '' })));
        setMatchTitle('');
      } else {
        setMessage({ type: 'error', text: '登録に失敗しました' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '通信エラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white font-sans flex flex-col items-center">
      <div className="w-full max-w-3xl mt-10">
        
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-yellow-500">
              NEXT MATCH SETUP
            </h1>
            <p className="text-gray-500 text-xs mt-1 tracking-[0.2em] uppercase font-bold">
              次回対戦カード（予告）登録
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

        <form onSubmit={handleSubmit} className="bg-[#111] border border-white/10 p-8 rounded-sm shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700"></div>

          <div className="mb-8">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block mb-2">試合名（第〇節 第〇試合 など）</label>
            <input
              type="text"
              value={matchTitle}
              onChange={(e) => setMatchTitle(e.target.value)}
              className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-500"
              placeholder="例: 第2節 第1試合"
              required
            />
          </div>

          <div className="space-y-4">
            {results.map((result, index) => {
              const selectedTeam = teams.find(t => t.id === result.teamId);
              return (
                <div key={index} className="flex flex-col md:flex-row gap-4 bg-black/50 p-4 border border-white/5 rounded-sm items-center">
                  
                  {/* 風の表示 */}
                  <div className="w-full md:w-32 text-center md:text-left">
                    <span className="text-xl font-black italic text-yellow-500 tracking-widest">{winds[index].split(' ')[0]}</span>
                    <span className="text-[10px] text-gray-500 ml-2">{winds[index].split(' ')[1]}</span>
                  </div>

                  {/* チーム選択 */}
                  <div className="flex-1 w-full">
                    <select
                      value={result.teamId}
                      onChange={(e) => handleResultChange(index, 'teamId', e.target.value)}
                      className="w-full bg-[#111] border border-white/10 p-2 text-white focus:outline-none focus:border-yellow-500"
                    >
                      <option value="">チームを選択</option>
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 選手選択 */}
                  <div className="flex-1 w-full">
                    <select
                      value={result.playerId}
                      onChange={(e) => handleResultChange(index, 'playerId', e.target.value)}
                      disabled={!result.teamId}
                      className="w-full bg-[#111] border border-white/10 p-2 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                    >
                      <option value="">出場選手を選択</option>
                      {selectedTeam?.players.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-black italic py-4 transition-all tracking-widest mt-8"
          >
            {isLoading ? "SAVING..." : "次回予告として登録する"}
          </button>
        </form>
      </div>
    </main>
  );
}