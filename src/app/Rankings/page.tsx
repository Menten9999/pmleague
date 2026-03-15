import React from 'react';

// ※実際はデータベースから取得します
const mockTeamRankings = [
  { rank: 1, name: "赤坂ドリブンズ", score: 450.5 },
  { rank: 2, name: "EX風林火山", score: 210.2 },
  { rank: 3, name: "KADOKAWAサクラナイツ", score: -50.4 },
  { rank: 4, name: "渋谷ABEMAS", score: -120.8 },
];

export default function RankingsPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white p-8 font-sans">
      <h1 className="text-4xl font-bold text-center mb-10 tracking-wider">
        TEAM RANKING
      </h1>
      
      <div className="max-w-4xl mx-auto bg-[#1e1e1e] rounded-xl shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2a2a2a] text-gray-400 text-sm uppercase tracking-wider">
              <th className="p-4 text-center">Rank</th>
              <th className="p-4">Team</th>
              <th className="p-4 text-right">Point</th>
            </tr>
          </thead>
          <tbody>
            {mockTeamRankings.map((team, index) => (
              <tr 
                key={team.name} 
                className="border-b border-gray-800 hover:bg-[#252525] transition-colors"
              >
                <td className="p-4 text-center text-2xl font-bold text-yellow-500">
                  {team.rank}
                </td>
                <td className="p-4 text-xl font-bold">{team.name}</td>
                <td className={`p-4 text-right text-2xl font-mono ${team.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {team.score > 0 ? '+' : ''}{team.score.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}