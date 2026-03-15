"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="bg-black min-h-screen" />;

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-yellow-500 selection:text-black">
      
      {/* スプラッシュ画面: 2.2秒後に上にスライドして消える */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black animate-slide-up-fade">
        <div className="text-center">
          <h1 className="text-6xl md:text-9xl font-black italic tracking-[0.2em] text-yellow-500 animate-reveal">
            PM LEAGUE
          </h1>
          <div className="mt-4 h-[1px] bg-yellow-500/50 w-0 animate-[shimmer_1.5s_ease-in-out_forwards] mx-auto"></div>
        </div>
      </div>

      {/* メインナビゲーション */}
      <nav className="fixed top-0 w-full z-40 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black italic tracking-tighter text-yellow-500 hover:opacity-80 transition-opacity">
              PM LEAGUE
            </Link>
            <div className="hidden md:flex gap-8 text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400">
              <Link href="/Rankings" className="hover:text-white transition-colors">Rankings</Link>
              <Link href="/teams" className="hover:text-white transition-colors">Teams</Link>
              <Link href="/schedule" className="hover:text-white transition-colors">Schedule</Link>
            </div>
          </div>
          <Link href="/Admin/Scores" className="text-[10px] border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all">
            ADMIN LOGIN
          </Link>
        </div>
      </nav>

      {/* ヒーローセクション: 次の対局 */}
      <div className="pt-32 pb-20 px-6">
        <section className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-12 h-[1px] bg-yellow-500"></span>
                <span className="text-yellow-500 text-xs font-bold tracking-[0.3em] uppercase">Next Match</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter">第1試合 出場選手</h2>
            </div>
            <div className="text-right">
              <p className="text-gray-500 font-mono text-sm">2024.03.20 SUN 19:00 START</p>
            </div>
          </div>

          {/* 出場選手カードグリッド */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { team: "TEAM RED", name: "選手 A", wind: "東", color: "bg-red-600" },
              { team: "TEAM BLUE", name: "選手 B", wind: "南", color: "bg-blue-600" },
              { team: "TEAM GREEN", name: "選手 C", wind: "西", color: "bg-emerald-600" },
              { team: "TEAM GOLD", name: "選手 D", wind: "北", color: "bg-amber-500" },
            ].map((p, i) => (
              <div key={i} className="group relative bg-[#111] border border-white/5 aspect-[3/4] overflow-hidden flex flex-col justify-end p-8 transition-all hover:border-white/20">
                {/* チームカラーのオーバーレイ */}
                <div className={`absolute top-0 left-0 w-full h-1 ${p.color}`}></div>
                <div className="absolute top-8 right-8 text-6xl font-black italic text-white/5 select-none">{p.wind}</div>
                
                <div className="relative z-10">
                  <p className="text-xs font-bold text-gray-500 mb-1 tracking-widest">{p.team}</p>
                  <h3 className="text-3xl font-bold mb-4 tracking-tight">{p.name}</h3>
                  <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-white/30"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 下部のリンクエリア */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Link href="/rankings" className="group p-10 bg-[#0a0a0a] border border-white/5 hover:bg-white hover:text-black transition-all">
            <span className="text-xs font-bold tracking-widest block mb-2">01</span>
            <h4 className="text-3xl font-black italic">RANKINGS & SCORES →</h4>
            <p className="mt-4 text-sm text-gray-500 group-hover:text-black/60">最新のチーム順位と個人成績を確認する</p>
          </Link>
          <Link href="/manager/roster" className="group p-10 bg-[#0a0a0a] border border-white/5 hover:bg-white hover:text-black transition-all">
            <span className="text-xs font-bold tracking-widest block mb-2">02</span>
            <h4 className="text-3xl font-black italic">MANAGER PORTAL →</h4>
            <p className="mt-4 text-sm text-gray-500 group-hover:text-black/60">監督専用ページ：出場選手の登録・変更</p>
          </Link>
        </div>
      </section>
    </main>
  );
}