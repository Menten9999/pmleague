"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Player = { id: string; name: string };
type Team = { id: string; name: string; players: Player[] };
type UserRole = 'ADMIN' | 'MANAGER' | 'GUEST';
type SessionUser = { role?: UserRole; teamId?: string | null };
type MatchEntry = {
  title: string;
  results: { teamId: string; playerId: string }[];
};

const createEmptyResults = () => [
  { teamId: '', playerId: '' },
  { teamId: '', playerId: '' },
  { teamId: '', playerId: '' },
  { teamId: '', playerId: '' },
];

export default function SchedulePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('GUEST');
  const [userTeamId, setUserTeamId] = useState('');
  const [isDualMatch, setIsDualMatch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1回で最大2試合分を入力できる
  const [matches, setMatches] = useState<MatchEntry[]>([
    { title: '', results: createEmptyResults() },
    { title: '', results: createEmptyResults() },
  ]);

  const winds = ["東家 (TON)", "南家 (NAN)", "西家 (XIA)", "北家 (PEI)"];
  const isManagerScoped = userRole === 'MANAGER' && !!userTeamId;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [sessionRes, teamsRes] = await Promise.all([
          fetch('/api/auth/session', { cache: 'no-store' }),
          fetch('/api/teams', { cache: 'no-store' }),
        ]);

        const sessionData = await sessionRes.json();
        const teamsData: Team[] = await teamsRes.json();
        const sessionUser = (sessionData?.user || {}) as SessionUser;

        const role = sessionUser.role || 'GUEST';
        const teamId = sessionUser.teamId || '';

        setUserRole(role);
        setUserTeamId(teamId);

        if (role === 'MANAGER' && teamId) {
          const ownTeam = teamsData.find((team) => team.id === teamId);
          if (!ownTeam) {
            setMessage({ type: 'error', text: 'あなたの所属チーム情報を取得できませんでした。管理者に確認してください。' });
            setTeams([]);
            return;
          }

          setTeams([ownTeam]);

          setMatches((prev) =>
            prev.map((match) => ({
              ...match,
              results: match.results.map((result) => ({
                teamId,
                playerId: ownTeam.players.some((p) => p.id === result.playerId) ? result.playerId : '',
              })),
            }))
          );
          return;
        }

        setTeams(teamsData);
      } catch (err) {
        console.error("初期データ取得エラー", err);
        setMessage({ type: 'error', text: '初期データの取得に失敗しました。' });
      }
    };

    loadInitialData();
  }, []);

  const handleResultChange = (
    matchIndex: number,
    resultIndex: number,
    field: 'teamId' | 'playerId',
    value: string
  ) => {
    if (field === 'teamId' && isManagerScoped) {
      return;
    }

    const newMatches = [...matches];
    const newResults = [...newMatches[matchIndex].results];
    newResults[resultIndex] = { ...newResults[resultIndex], [field]: value };

    if (field === 'teamId') {
      newResults[resultIndex].playerId = ''; // チームが変わったら選手をリセット
    }

    newMatches[matchIndex] = { ...newMatches[matchIndex], results: newResults };
    setMatches(newMatches);
  };

  const handleTitleChange = (matchIndex: number, value: string) => {
    const newMatches = [...matches];
    newMatches[matchIndex] = { ...newMatches[matchIndex], title: value };
    setMatches(newMatches);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const targetMatches = isDualMatch ? matches : matches.slice(0, 1);

    if (isManagerScoped && targetMatches.some((m) => m.results.some((r) => r.teamId !== userTeamId))) {
      setMessage({ type: 'error', text: '監督は自チームの選手のみ登録できます。' });
      setIsLoading(false);
      return;
    }

    const hasIncomplete = targetMatches.some((m) =>
      m.results.some((r) => !r.teamId || !r.playerId)
    );

    if (hasIncomplete) {
      setMessage({ type: 'error', text: 'すべての試合で4家のチームと選手を選択してください。' });
      setIsLoading(false);
      return;
    }

    if (isDualMatch) {
      const allSelectedIds = targetMatches.flatMap((m) => m.results.map((r) => r.playerId));
      if (new Set(allSelectedIds).size !== allSelectedIds.length) {
        setMessage({ type: 'error', text: '2試合同時登録では同じ選手を重複して指定できません。' });
        setIsLoading(false);
        return;
      }
    }

    const hasDuplicatePlayerInMatch = targetMatches.some((m) => {
      const ids = m.results.map((r) => r.playerId);
      return new Set(ids).size !== ids.length;
    });

    if (hasDuplicatePlayerInMatch) {
      setMessage({ type: 'error', text: '同一試合に同じ選手を重複登録できません。' });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/matches/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches: targetMatches }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || '次回予告を登録しました！' });
        setMatches([
          { title: '', results: createEmptyResults() },
          { title: '', results: createEmptyResults() },
        ]);
        setIsDualMatch(false);
      } else {
        setMessage({ type: 'error', text: data.error || '登録に失敗しました' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '通信エラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] p-4 md:p-6 text-white font-sans flex flex-col items-center">
      <div className="w-full max-w-3xl mt-8 md:mt-10">
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-yellow-500">
              NEXT MATCH SETUP
            </h1>
            <p className="text-gray-500 text-[10px] md:text-xs mt-1 tracking-[0.12em] md:tracking-[0.2em] uppercase font-bold">
              次回対戦カード（予告）登録 / 同時2試合対応
            </p>
            {isManagerScoped && (
              <p className="text-[10px] md:text-xs mt-2 text-yellow-400 tracking-wide font-bold">
                監督モード: 所属チームの選手のみ選択できます
              </p>
            )}
          </div>
          <Link href="/" className="text-xs md:text-sm text-gray-400 hover:text-yellow-500 transition-colors">
            トップへ戻る
          </Link>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded-sm border ${message.type === 'error' ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-green-900/50 border-green-500 text-green-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#111] border border-white/10 p-5 sm:p-8 rounded-sm shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700"></div>

          <div className="mb-6 sm:mb-8 p-4 bg-black/40 border border-white/10 rounded-sm">
            <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block mb-2">登録モード</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="radio"
                  name="matchMode"
                  checked={!isDualMatch}
                  onChange={() => setIsDualMatch(false)}
                />
                1試合登録
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="radio"
                  name="matchMode"
                  checked={isDualMatch}
                  onChange={() => setIsDualMatch(true)}
                />
                2試合同時登録
              </label>
            </div>
          </div>

          <div className="space-y-8">
            {(isDualMatch ? matches : matches.slice(0, 1)).map((match, matchIndex) => (
              <div key={matchIndex} className="p-4 bg-black/40 border border-white/10 rounded-sm">
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block mb-2">
                    試合名（第〇節 第〇試合 など）
                  </label>
                  <input
                    type="text"
                    value={match.title}
                    onChange={(e) => handleTitleChange(matchIndex, e.target.value)}
                    className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-500"
                    placeholder={`例: 第2節 第${matchIndex + 1}試合`}
                    required
                  />
                </div>

                <div className="mb-3 text-xs font-bold tracking-widest uppercase text-yellow-500">
                  Match {matchIndex + 1}
                </div>

                <div className="space-y-4">
                  {match.results.map((result, resultIndex) => {
                    const resolvedTeamId = isManagerScoped ? userTeamId : result.teamId;
                    const selectedTeam = teams.find(t => t.id === resolvedTeamId);
                    return (
                      <div key={resultIndex} className="flex flex-col md:flex-row gap-4 bg-black/50 p-4 border border-white/5 rounded-sm items-center">
                        <div className="w-full md:w-32 text-center md:text-left">
                          <span className="text-xl font-black italic text-yellow-500 tracking-widest">{winds[resultIndex].split(' ')[0]}</span>
                          <span className="text-[10px] text-gray-500 ml-2">{winds[resultIndex].split(' ')[1]}</span>
                        </div>

                        <div className="flex-1 w-full">
                          {isManagerScoped ? (
                            <div className="w-full bg-[#111] border border-yellow-500/40 p-2 text-yellow-300 font-bold">
                              {selectedTeam?.name || '所属チーム未設定'}
                            </div>
                          ) : (
                            <select
                              value={result.teamId}
                              onChange={(e) => handleResultChange(matchIndex, resultIndex, 'teamId', e.target.value)}
                              className="w-full bg-[#111] border border-white/10 p-2 text-white focus:outline-none focus:border-yellow-500"
                            >
                              <option value="">チームを選択</option>
                              {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div className="flex-1 w-full">
                          <select
                            value={result.playerId}
                            onChange={(e) => handleResultChange(matchIndex, resultIndex, 'playerId', e.target.value)}
                            disabled={!resolvedTeamId}
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
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-black italic py-4 transition-all tracking-widest mt-8"
          >
            {isLoading ? "SAVING..." : isDualMatch ? "2試合同時に登録する" : "次回予告として登録する"}
          </button>
        </form>
      </div>
    </main>
  );
}