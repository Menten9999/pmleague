import React from 'react';

const nextMatchPlayers = [
  { team: "渋谷ABEMAS", name: "多井 隆晴", wind: "東" },
  { team: "EX風林火山", name: "二階堂 亜樹", wind: "南" },
  { team: "赤坂ドリブンズ", name: "園田 賢", wind: "西" },
  { team: "KADOKAWAサクラナイツ", name: "内川 幸太郎", wind: "北" },
];

export default function NextMatchPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
      <p className="text-yellow-500 font-bold tracking-widest mb-4">NEXT MATCH</p>
      <h1 className="text-5xl font-black mb-12 italic">第1試合 出場選手</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-6xl">
        {nextMatchPlayers.map((player) => (
          <div key={player.name} className="relative bg-[#1a1a1a] p-6 rounded-lg border-t-4 border-yellow-500 text-center shadow-lg transform hover:scale-105 transition-transform">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-bold px-4 py-1 rounded-full text-sm">
              {player.wind}家
            </div>
            <p className="text-gray-400 text-sm mt-4 mb-2">{player.team}</p>
            <h2 className="text-2xl font-bold">{player.name}</h2>
          </div>
        ))}
      </div>
      
      <div className="mt-16 text-4xl font-black text-gray-700 italic">VS</div>
    </div>
  );
}