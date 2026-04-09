"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Player = { id: string; name: string };
type Team = { id: string; name: string; players: Player[] };
type UserRole = 'ADMIN' | 'MANAGER' | 'GUEST';
type SessionUser = { role?: UserRole; teamId?: string | null };
type ScheduledResult = {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  wind: 'EAST' | 'SOUTH' | 'WEST' | 'NORTH' | null;
};
type ScheduledMatch = {
  id: string;
  title: string | null;
  selectedTeamsCount: number;
  isWindAssigned: boolean;
  results: ScheduledResult[];
};

export default function SchedulePage() {
  const [userRole, setUserRole] = useState<UserRole>('GUEST');
  const [userTeamId, setUserTeamId] = useState('');
  const [ownTeam, setOwnTeam] = useState<Team | null>(null);
  const [scheduledMatches, setScheduledMatches] = useState<ScheduledMatch[]>([]);

  const [isDualMatch, setIsDualMatch] = useState(false);
  const [adminTitles, setAdminTitles] = useState(['', '']);

  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isManagerScoped = userRole === 'MANAGER' && !!userTeamId;

  const reloadScheduledMatches = async () => {
    const scheduleRes = await fetch('/api/matches/schedule', { cache: 'no-store' });
    const scheduleData: ScheduledMatch[] = await scheduleRes.json();
    setScheduledMatches(scheduleData);
  };

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
            setOwnTeam(null);
            return;
          }

          setOwnTeam(ownTeam);
        }

        await reloadScheduledMatches();
      } catch (err) {
        console.error("初期データ取得エラー", err);
        setMessage({ type: 'error', text: '初期データの取得に失敗しました。' });
      }
    };

    loadInitialData();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const targetTitles = (isDualMatch ? adminTitles : adminTitles.slice(0, 1)).map((title) => title.trim());

    if (targetTitles.some((title) => !title)) {
      setMessage({ type: 'error', text: '作成する試合名を入力してください。' });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/matches/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches: targetTitles.map((title) => ({ title })) }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || '次回予定を登録しました！' });
        setAdminTitles(['', '']);
        setIsDualMatch(false);
        await reloadScheduledMatches();
      } else {
        setMessage({ type: 'error', text: data.error || '登録に失敗しました' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '通信エラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitManagerEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    if (!selectedMatchId || !selectedPlayerId) {
      setMessage({ type: 'error', text: '試合と出場選手を選択してください。' });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/matches/schedule/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: selectedMatchId, playerId: selectedPlayerId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || '出場選手を登録しました。' });
        await reloadScheduledMatches();
      } else {
        setMessage({ type: 'error', text: data.error || '登録に失敗しました' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '通信エラーが発生しました' });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedMatch = scheduledMatches.find((match) => match.id === selectedMatchId);
  const mySelectedPlayerId = selectedMatch?.results.find((r) => r.teamId === userTeamId)?.playerId || '';
  const isSelectedMatchLocked = !!selectedMatch?.isWindAssigned;

  useEffect(() => {
    if (!selectedMatchId || !isManagerScoped) return;
    setSelectedPlayerId(mySelectedPlayerId);
  }, [selectedMatchId, mySelectedPlayerId, isManagerScoped]);

  return (
    <main className="min-h-screen bg-[#050505] p-4 md:p-6 text-white font-sans flex flex-col items-center">
      <div className="w-full max-w-3xl mt-8 md:mt-10">
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-8 border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-yellow-500">
              NEXT MATCH SETUP
            </h1>
            <p className="text-gray-500 text-[10px] md:text-xs mt-1 tracking-[0.12em] md:tracking-[0.2em] uppercase font-bold">
              次回対戦カード（予告）登録 / 出場選手提出
            </p>
            {isManagerScoped && (
              <p className="text-[10px] md:text-xs mt-2 text-yellow-400 tracking-wide font-bold">
                監督モード: 試合を選択して所属選手から1名を提出してください
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

        {userRole === 'ADMIN' && (
          <form onSubmit={handleCreateSchedule} className="bg-[#111] border border-white/10 p-5 sm:p-8 rounded-sm shadow-2xl relative">
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

            <div className="space-y-4">
              {(isDualMatch ? [0, 1] : [0]).map((index) => (
                <div key={index}>
                  <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block mb-2">
                    試合名
                  </label>
                  <input
                    type="text"
                    value={adminTitles[index]}
                    onChange={(e) => {
                      const next = [...adminTitles];
                      next[index] = e.target.value;
                      setAdminTitles(next);
                    }}
                    className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-500"
                    placeholder={`例: 第2節 第${index + 1}試合`}
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-black italic py-4 transition-all tracking-widest mt-8"
            >
              {isLoading ? "SAVING..." : isDualMatch ? "2試合の予定を登録する" : "試合予定を登録する"}
            </button>
          </form>
        )}

        {isManagerScoped && ownTeam && (
          <form onSubmit={handleSubmitManagerEntry} className="bg-[#111] border border-white/10 p-5 sm:p-8 rounded-sm shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700"></div>

            <div className="mb-6 p-4 bg-black/40 border border-white/10 rounded-sm">
              <div className="text-xs text-gray-400 tracking-widest uppercase mb-2">あなたのチーム</div>
              <div className="text-lg font-black italic text-yellow-400">{ownTeam.name}</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block mb-2">対象試合</label>
                <select
                  value={selectedMatchId}
                  onChange={(e) => setSelectedMatchId(e.target.value)}
                  className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="">試合を選択</option>
                  {scheduledMatches
                    .filter((match) => !match.isWindAssigned)
                    .map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.title || '次回 対戦カード'} / 提出済み {match.selectedTeamsCount}/4
                    </option>
                    ))}
                </select>
                {scheduledMatches.every((match) => match.isWindAssigned) && (
                  <p className="text-xs text-gray-500 mt-2">提出可能な試合は現在ありません。</p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase block mb-2">出場選手</label>
                <select
                  value={selectedPlayerId}
                  onChange={(e) => setSelectedPlayerId(e.target.value)}
                  disabled={!selectedMatchId || isSelectedMatchLocked}
                  className="w-full bg-black border border-white/10 p-3 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                >
                  <option value="">選手を選択</option>
                  {ownTeam.players.map((player) => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
                {isSelectedMatchLocked && (
                  <p className="text-xs text-red-400 mt-2">この試合は方角抽選が完了しているため再提出できません。</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !selectedMatchId || !selectedPlayerId || isSelectedMatchLocked}
                className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 text-black font-black italic py-4 transition-all tracking-widest"
              >
                {isLoading ? 'SAVING...' : '出場選手を登録する'}
              </button>
            </div>
          </form>
        )}

        {!isManagerScoped && userRole !== 'ADMIN' && (
          <div className="bg-[#111] border border-white/10 p-6 rounded-sm text-center text-gray-400">
            この画面は管理者または監督のみ利用できます。
          </div>
        )}

        <div className="mt-8 bg-[#111] border border-white/10 p-5 sm:p-6 rounded-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700"></div>
          <div className="mb-3 text-xs font-bold tracking-widest uppercase text-yellow-500">
            現在の試合予定
          </div>

          <div className="space-y-3">
            {scheduledMatches.map((match) => (
              <div key={match.id} className="bg-black/40 border border-white/10 p-4 rounded-sm">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="font-bold tracking-wide text-white">{match.title || '次回 対戦カード'}</div>
                  <div className="text-xs text-gray-400">提出済み: {match.selectedTeamsCount}/4</div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  {match.isWindAssigned ? '全監督提出完了: 方角抽選済み' : '監督の提出待ち'}
                </div>

                <div className="mt-3 text-xs text-gray-300">
                  提出済み選手: {match.results.length > 0 ? match.results.map((r) => `${r.teamName} / ${r.playerName}`).join(' , ') : 'まだありません'}
                </div>
              </div>
            ))}

            {scheduledMatches.length === 0 && (
              <div className="text-center text-gray-500 py-6">現在登録されている試合予定はありません。</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}