{/* =========================================
            次回予告（NEXT MATCH）セクション
            ========================================= */}
        <section className="mb-20">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-6">
            <h2 className="text-2xl font-black italic tracking-wider text-yellow-500">
              NEXT MATCH
            </h2>
            <span className="text-[10px] text-gray-500 tracking-widest uppercase">次回 対戦カード</span>
          </div>

          {nextMatch ? (
            <div className="bg-[#111] border border-yellow-600/30 p-8 rounded-sm shadow-[0_0_30px_rgba(234,179,8,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700 via-yellow-400 to-yellow-700"></div>
              
              <div className="text-center mb-8">
                <div className="text-yellow-500 font-bold tracking-widest mb-2 text-xl">{nextMatch.title}</div>
                <div className="text-xs text-gray-400 tracking-widest">出場予定選手</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* 🌟 ID順（登録した順）に並べ替えてから表示する */}
                {[...nextMatch.results].sort((a, b) => a.id - b.id).map((res, i) => {
                  const winds = ["東", "南", "西", "北"];
                  const windColors = ["text-red-500", "text-blue-500", "text-green-500", "text-gray-400"];

                  return (
                    <div key={res.id} className="bg-black border border-white/10 p-4 text-center rounded-sm relative overflow-hidden flex flex-col justify-center items-center h-32">
                      {/* チームカラーのライン */}
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: res.player.team?.color || '#eab308' }}></div>
                      
                      {/* 🌟 風の表示 */}
                      <div className="absolute top-2 left-2 opacity-20 text-4xl font-black italic select-none">
                        {winds[i]}
                      </div>
                      
                      <div className="z-10 relative">
                        <div className={`text-sm font-black italic ${windColors[i]} mb-1`}>{winds[i]}家</div>
                        <div className="text-[10px] text-gray-500 tracking-widest uppercase mb-1">
                          {res.player.team?.name}
                        </div>
                        <div className="text-xl font-bold text-white tracking-wider">
                          {res.player.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-[#111] border border-white/10 p-12 text-center rounded-sm">
              <div className="text-gray-500 font-bold tracking-widest">
                次節の対戦カードは現在調整中です。
              </div>
            </div>
          )}
        </section>