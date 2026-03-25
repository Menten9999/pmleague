import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();
export const revalidate = 0;

export default async function PublicArchivePage() {
  // 保存されたアーカイブを新しい順に取得
  const archives = await prisma.seasonArchive.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-[#050505] p-4 md:p-6 text-white font-sans flex flex-col items-center">
      <div className="w-full max-w-5xl mt-8 md:mt-10">
        
        <div className="text-center mb-10 md:mb-16 border-b border-white/10 pb-5 md:pb-6">
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-yellow-500">
            PAST SEASONS
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-2 tracking-[0.2em] md:tracking-[0.3em] uppercase font-bold">
            過去のシーズン最終成績
          </p>
        </div>

        <div className="space-y-10 md:space-y-16">
          {archives.map((archive) => {
            // 文字列として保存されているJSONデータを本来の形に戻す
            const data = JSON.parse(archive.data);
            const teams = data.teams || [];
            const players = data.players || [];

            return (
              <section key={archive.id} className="bg-[#111] border border-white/10 rounded-sm overflow-hidden">
                {/* シーズンタイトル */}
                <div className="bg-yellow-900/20 border-b border-yellow-600/30 p-4 sm:p-6">
                  <h2 className="text-2xl sm:text-3xl font-black italic text-yellow-500 tracking-wider">
                    {archive.title}
                  </h2>
                  <div className="text-xs text-gray-500 mt-2 font-mono">
                    Date: {new Date(archive.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>

                <div className="p-4 sm:p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  {/* チームランキング */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase border-b border-white/10 pb-2 mb-4">
                      Final Team Standings
                    </h3>
                    <div className="space-y-2">
                      {teams.map((team: any, index: number) => (
                        <div key={team.id} className="flex items-center justify-between gap-3 bg-black/50 p-3 border border-white/5 rounded-sm relative overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: team.color || '#eab308' }}></div>
                          <div className="flex items-center gap-3 pl-3 min-w-0">
                            <span className="font-black italic text-xl text-gray-600 w-6">{index + 1}</span>
                            <span className="font-bold tracking-wider truncate">{team.name}</span>
                          </div>
                          <span className={`font-mono font-bold ${team.totalScore >= 0 ? 'text-white' : 'text-red-500'}`}>
                            {team.totalScore > 0 ? '+' : ''}{Number(team.totalScore).toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 個人ランキング（上位のみ表示などのアレンジも可能） */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase border-b border-white/10 pb-2 mb-4">
                      Final Player Standings
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {players.map((player: any, index: number) => (
                        <div key={player.id} className="flex items-center justify-between bg-black/50 p-2 border border-white/5 rounded-sm">
                          <div className="flex items-center gap-3">
                            <span className="font-black italic text-lg text-gray-600 w-6 text-center">{index + 1}</span>
                            <div>
                              <div className="text-[10px] text-gray-500 uppercase">{player.team?.name || '不明'}</div>
                              <div className="font-bold text-sm">{player.name}</div>
                            </div>
                          </div>
                          <span className={`font-mono font-bold text-sm ${player.totalScore >= 0 ? 'text-white' : 'text-red-500'}`}>
                            {player.totalScore > 0 ? '+' : ''}{Number(player.totalScore).toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}

          {archives.length === 0 && (
            <div className="text-center text-gray-500 py-20 font-bold tracking-widest">
              アーカイブされたシーズンはまだありません。
            </div>
          )}
        </div>

        <div className="mt-16 text-center pb-10">
           <Link href="/" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors tracking-widest uppercase">
             ← BACK TO TOP
           </Link>
        </div>
      </div>
    </main>
  );
}