import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();
export const revalidate = 0;

export default async function RankingsPage() {
  const teams = await prisma.team.findMany({
    orderBy: { totalScore: 'desc' },
  });

  const players = await prisma.player.findMany({
    include: { team: true },
    orderBy: { totalScore: 'desc' },
  });

  const topTeamScore = teams[0]?.totalScore ?? 0;
  const topPlayerScore = players[0]?.totalScore ?? 0;

  return (
    <main className="min-h-screen bg-[#050505] p-6 text-white font-sans">
      <div className="max-w-6xl mx-auto mt-10">
        
        <div className="text-center mb-16 border-b border-white/10 pb-6">
          <h1 className="text-5xl font-black italic tracking-tighter text-yellow-500">RANKINGS</h1>
          <p className="text-gray-500 text-sm mt-2 tracking-[0.3em] uppercase font-bold">PMリーグ 最新ランキング</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <section>
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="text-2xl font-black italic tracking-wider text-yellow-500">TEAM RANKING</h2>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase">チーム成績</span>
            </div>
            
            <div className="space-y-3">
              {teams.map((team, index) => (
                <div key={team.id} className="bg-[#111] border border-white/10 p-3 md:p-4 rounded-sm relative overflow-hidden transition-colors hover:border-white/30 m-ranking-row">
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: team.color || '#eab308' }}></div>
                  
                  <div className="m-ranking-left gap-3 md:gap-4 flex-grow pr-4">
                    <div className="w-6 md:w-8 text-center font-black italic text-xl md:text-2xl text-gray-600 shrink-0">{index + 1}</div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-black border border-white/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-[6px] text-gray-500">LOGO</span>
                    </div>
                    <div className="text-sm md:text-lg font-bold tracking-wider truncate">{team.name}</div>
                  </div>
                  
                  <div className="m-ranking-right gap-3 md:gap-6">
                    <div className={`text-lg md:text-2xl font-mono font-bold w-16 md:w-24 text-right shrink-0 ${team.totalScore >= 0 ? 'text-white' : 'text-red-500'}`}>
                      {team.totalScore > 0 ? '+' : ''}{team.totalScore.toFixed(1)}
                    </div>
                    <div className="w-16 md:w-24 text-right shrink-0">
                      {index === 0 ? (
                        <span className="text-[10px] md:text-xs text-yellow-500 font-bold tracking-widest uppercase">Leader</span>
                      ) : (
                        <span className="text-[10px] md:text-xs text-gray-500 font-mono tracking-widest">
                          首位差 <span className="text-gray-300">{(team.totalScore - topTeamScore).toFixed(1)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {teams.length === 0 && <div className="text-center text-gray-500 py-10 font-bold tracking-widest text-sm">NO DATA</div>}
            </div>
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-2">
              <h2 className="text-2xl font-black italic tracking-wider text-yellow-500">PLAYER RANKING</h2>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase">個人成績</span>
            </div>
            
            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={player.id} className="bg-[#111] border border-white/10 p-3 md:p-4 rounded-sm relative overflow-hidden transition-colors hover:border-white/30 m-ranking-row">
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: player.team?.color || '#eab308' }}></div>
                  
                  <div className="m-ranking-left gap-3 md:gap-4 flex-grow pr-4">
                    <div className="w-6 md:w-8 text-center font-black italic text-xl md:text-2xl text-gray-600 shrink-0">{index + 1}</div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-black border border-white/10 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-[6px] text-gray-500">PHOTO</span>
                    </div>
                    <div className="flex flex-col truncate">
                      <div className="text-sm md:text-lg font-bold tracking-wider truncate">{player.name}</div>
                      <div className="text-[8px] md:text-[10px] text-gray-500 tracking-widest uppercase mt-0.5 truncate">{player.team?.name}</div>
                    </div>
                  </div>
                  
                  <div className="m-ranking-right gap-3 md:gap-6">
                    <div className={`text-lg md:text-2xl font-mono font-bold w-16 md:w-24 text-right shrink-0 ${player.totalScore >= 0 ? 'text-white' : 'text-red-500'}`}>
                      {player.totalScore > 0 ? '+' : ''}{player.totalScore.toFixed(1)}
                    </div>
                    <div className="w-16 md:w-24 text-right shrink-0">
                      {index === 0 ? (
                        <span className="text-[10px] md:text-xs text-yellow-500 font-bold tracking-widest uppercase">Leader</span>
                      ) : (
                        <span className="text-[10px] md:text-xs text-gray-500 font-mono tracking-widest">
                          首位差 <span className="text-gray-300">{(player.totalScore - topPlayerScore).toFixed(1)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {players.length === 0 && <div className="text-center text-gray-500 py-10 font-bold tracking-widest text-sm">NO DATA</div>}
            </div>
          </section>

        </div>
        
        <div className="mt-16 text-center pb-10">
           <Link href="/" className="text-sm text-gray-400 hover:text-yellow-500 transition-colors tracking-widest uppercase">← BACK TO TOP</Link>
        </div>
      </div>
    </main>
  );
}