"use client";
import React, { useState } from 'react';

export default function ScoreEntryPage() {
  // 実際の開発では Server Actions や API Routes にデータを送信します
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("スコアを登録し、ポイントを再計算しました。");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 border-b pb-2">【管理者】試合結果登録</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {["東", "南", "西", "北"].map((wind) => (
            <div key={wind} className="flex items-center gap-4 bg-gray-50 p-4 rounded border">
              <span className="font-bold text-lg w-12 text-center">{wind}家</span>
              <select className="flex-1 p-2 border rounded" required>
                <option value="">選手を選択</option>
                <option value="1">多井 隆晴</option>
                <option value="2">二階堂 亜樹</option>
                {/* 選手リストをマッピング */}
              </select>
              <input 
                type="number" 
                placeholder="素点 (例: 35000)" 
                className="flex-1 p-2 border rounded"
                required 
              />
            </div>
          ))}
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
          >
            結果を確定してランキングを更新
          </button>
        </form>
      </div>
    </div>
  );
}