import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

// CSSモジュールを読み込む
import styles from "./page.module.css";

const prisma = new PrismaClient();
export const revalidate = 0;

export default async function Home() {
  const session = await auth();

  const nextMatch = await prisma.match.findFirst({
    where: { status: "SCHEDULED" },
    orderBy: { id: "asc" },
    include: {
      results: { include: { player: { include: { team: true } } } },
    },
  });

  const topTeams = await prisma.team.findMany({
    orderBy: { totalScore: "desc" },
    take: 4,
  });

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden">
      
      {/* =========================================
          HERO セクション（キービジュアル）
          ========================================= */}
      <section className={`${styles.mStripeBg} relative w-full h-[80vh] flex flex-col items-center justify-center border-b border-yellow-600/30 overflow-hidden`}>
        <div className="absolute inset-0 bg-[url('https://placehold.co/1920x1080/111111/333333?text=KEY+VISUAL+IMAGE')] bg-cover bg-center bg-no-repeat opacity-20 mix-blend-luminosity scale-105 animate-[pulse_10s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/80"></div>
        
        {/* 🌟 アニメーションクラス（fadeInUp）を適用 */}
        <div className={`${styles.fadeInUp} relative z-10 text-center flex flex-col items-center`}>
          <div className="w-1 h-24 bg-gradient-to-b from-yellow-300 to-yellow-700 transform rotate-45 mb-6"></div>
          
          <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter drop-shadow-2xl">
            <span className="text-white">PM </span>
            <span className={styles.textGoldGradient}>LEAGUE</span>
          </h1>
          <p className="mt-6 text-yellow-500 tracking-[0.5em] text-sm md:text-lg font-bold">
            THE PREMIER MAHJONG STAGE
          </p>
        </div>
      </section>

      {/* 🌟 中央揃え＆サイズ制御のメインコンテナ（mainContainer） */}
      <div className={styles.mainContainer}>
        
        {/* =========================================
            NEXT MATCH（次回予告）
            ========================================= */}
        {/* 🌟 少し遅れてアニメーション（fadeInUp delay1） */}
        <section className={`${styles.sectionWrapper} ${styles.fadeInUp} ${styles.delay1}`}>
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black italic tracking-wider text-white">
              NEXT <span className="text-yellow-500">MATCH</span>
            </h2>
            <span className="text-xs text-yellow-600 tracking-[0.3em] uppercase mt-2 block">次回対戦カード</span>
          </div>

          {nextMatch ? (
            <div className={`${styles.glowPanel} p-1 md:p-2 relative group max-w-5xl`}>
              <div className="bg-[#0a0a0a] p-8 md:p-12">
                <div className="text-center mb-10">
                  <div className="inline-block bg-yellow-500 text-black font-bold tracking-widest px-8 py-2 text-xl transform -skew-x-12">
                    <span className="block transform skew-x-12">{nextMatch.title}</span>
                  </div>
                </div>

                {/* 🌟 選手カードを均等に中央に並べるグリッド（matchGrid） */}
                <div className={styles.matchGrid}>
                  {[...nextMatch.results].sort((a, b) => String(a.id).localeCompare(String(b.id))).map((res, i) => {
                    const winds = ["東", "南", "西", "北"];
                    const windColors = ["text-red-500", "text-blue-500", "text-green-500", "text-gray-400"];

                    return (
                      <div key={res.id} className="relative bg-[#111] p-6 text-center border border-white/5 hover:border-white/20 hover:bg-[#151515] transition-all flex flex-col items-center justify-center min-h-[200px]">
                        <div className="absolute inset-0 bg-[url('https://placehold.co/400x600/222222/444444?text=PLAYER')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
                        <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: res.player.team?.color || '#eab308' }}></div>
                        
                        <div className="z-10 relative mt-auto">
                          <div className={`text-xl font-black italic ${windColors[i]} mb-2`}>{winds[i]}家</div>
                          <div className="text-xs text-gray-400 tracking-widest uppercase mb-1">{res.player.team?.name}</div>
                          <div className="text-2xl font-bold text-white tracking-wider">{res.player.name}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className={`${styles.glowPanel} p-16 text-center max-w-3xl`}>
              <div className="text-gray-500 font-bold tracking-widest">次節の対戦カードは現在調整中です。</div>
            </div>
          )}
          
          <Link href="/Matches" className={styles.skewButton}>
            <span>試合一覧を見る</span>
          </Link>
        </section>

        {/* =========================================
            STANDINGS（ランキング）
            ========================================= */}
        {/* 🌟 さらに遅れてアニメーション（fadeInUp delay2） */}
        <section className={`${styles.sectionWrapper} ${styles.fadeInUp} ${styles.delay2}`}>
           <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black italic tracking-wider text-white">
              TEAM <span className="text-yellow-500">STANDINGS</span>
            </h2>
            <span className="text-xs text-yellow-600 tracking-[0.3em] uppercase mt-2 block">チームランキング速報</span>
          </div>
          
          {/* 🌟 ランキングをスリムに中央配置（standingsWrapper） */}
          <div className={styles.standingsWrapper}>
            {topTeams.map((team, index) => (
              <div key={team.id} className="bg-[#111] hover:bg-[#1a1a1a] border border-white/5 hover:border-white/20 p-6 flex items-center transition-all relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: team.color || '#eab308' }}></div>
                
                <div className="w-16 text-center font-black italic text-4xl text-gray-700 group-hover:text-yellow-500 transition-colors">
                  {index + 1}
                </div>
                
                <div className="w-12 h-12 bg-black border border-white/10 rounded-full mx-4 flex items-center justify-center shrink-0">
                  <span className="text-[8px] text-gray-500">LOGO</span>
                </div>

                <div className="flex-grow font-bold tracking-wider text-xl">{team.name}</div>
                
                <div className={`text-3xl font-mono font-black italic ${team.totalScore >= 0 ? 'text-white' : 'text-red-500'}`}>
                  {team.totalScore > 0 ? '+' : ''}{team.totalScore.toFixed(1)}
                </div>
              </div>
            ))}
          </div>

          <Link href="/Rankings" className={styles.skewButton}>
            <span>ランキング詳細を見る</span>
          </Link>
        </section>

      </div>
    </main>
  );
}