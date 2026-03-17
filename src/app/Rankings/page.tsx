import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

// 常に最新のデータベース情報を取得して画面を作る設定
export const revalidate = 0;

export default async function RankingsPage() {
  // 🌟 チームランキングの取得（totalScore が大きい順に並べ替え）
  const teams = await prisma.team.findMany({
    orderBy: {
      totalScore: 'desc',
    },
  });

  // 🌟 個人ランキングの取得（totalScore が大きい順に並べ替え）
  const players = await prisma.player.findMany({
    include: {
      team: true, // 所属チームの名前や色も一緒に取得
    },
    orderBy: {
      totalScore: 'desc',
    },
  });

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white font-sans">
      <div className="max-w-6xl mx-auto mt-10">
        
        {/* ヘッダー */}
        <div className="text-center mb-16 border-b border-white/10 pb-6">
          <h1 className="text-5xl font-black italic tracking-tighter text-yellow-500">
            RANKINGS
          </h1>
          <p className="text-gray-500 text-sm mt-2 tracking-[0.3em] uppercase font-bold">
            PMリーグ 最新ランキング
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* =======================
              チームランキング セクション
              ======================= */}
          <section>
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="text-2xl font-black italic tracking-wider text-yellow-500">
                TEAM RANKING
              </h2>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase">チーム成績</span>
            </div>
            
            <div className="space-y-3">
              {teams.map((team, index) => (
                <div key={team.id} className="bg-[#111] border border-white/10 p-4 flex items-center rounded-sm relative overflow-hidden transition-colors hover:border-white/30">
                  {/* チームカラーのサイドライン */}
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: team.color || '#eab308' }}></div>
                  
                  {/* 順位 */}
                  <div className="w-12 text-center font-black italic text-2xl text-gray-600">
                    {index + 1}
                  </div>
                  
                  {/* チーム名 */}
                  <div className="flex-grow pl-4">
                    <div className="text-lg font-bold tracking-wider">{team.name}</div>
                  </div>
                  
                  {/* スコア（プラスなら+を付け、マイナスなら赤色にする） */}
                  <div className={`text-2xl font-mono font-bold ${team.totalScore >= 0 ? 'text-white' : 'text-red-500'}`}>
                    {team.totalScore > 0 ? '+' : ''}{team.totalScore.toFixed(1)}
                  </div>
                </div>
              ))}
              
              {teams.length === 0 && (
                <div className="text-center text-gray-500 py-10 font-bold tracking-widest text-sm">NO DATA</div>
              )}
            </div>
          </section>

          {/* =======================
              個人ランキング セクション
              ======================= */}
          <section>
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="text-2xl font-black italic tracking-wider text-yellow-500">
                PLAYER RANKING
              </h2>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase">個人成績</span>
            </div>
            
            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={player.id} className="bg-[#111] border border-white/10 p-4 flex items-center rounded-sm relative overflow-hidden transition-colors hover:border-white/30">
                  {/* 所属チームカラーのサイドライン */}
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: player.team?.color || '#eab308' }}></div>
                  
                  {/* 順位 */}
                  <div className="w-12 text-center font-black italic text-2xl text-gray-600">
                    {index + 1}
                  </div>
                  
                  {/* 選手名＆所属チーム名 */}
                  <div className="flex-grow pl-4">
                    <div className="text-lg font-bold tracking-wider">{player.name}</div>
                    <div className="text-[10px] text-gray-500 tracking-widest uppercase mt-1">{player.team?.name}</div>
                  </div>
                  
                  {/* スコア */}
                  <div className={`text-2xl font-mono font-bold ${player.totalScore >= 0 ? 'text-white' : 'text-red-500'}`}>
                    {player.totalScore > 0 ? '+' : ''}{player.totalScore.toFixed(1)}
                  </div>
                </div>
              ))}
              
              {players.length === 0 && (
                <div className="text-center text-gray-500 py-10 font-bold tracking-widest text-sm">NO DATA</div>
              )}
            </div>
          </section>

        </div>
        
        {/* フッターリンク */}
        <div className="mt-16 text-center pb-10">
           <Link href="/" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors tracking-widest uppercase">
             ← BACK TO TOP
           </Link>
        </div>
      </div>
    </main>
  );
}