import React from 'react';
import { Terminal, Trophy, BookOpen } from 'lucide-react';
import type { Level } from '../types';

interface HomePageProps {
  onSelectPractice: () => void;
  onSelectTimeAttack: (level: Level) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectPractice, onSelectTimeAttack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <Terminal className="w-20 h-20 text-green-400 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-2">Linux コマンド練習</h1>
          <p className="text-gray-400 text-lg">grep / sed / awk をマスターしよう</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={onSelectPractice}
            className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 p-8 rounded-xl shadow-xl transition transform hover:scale-105"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">練習する</h2>
            <p className="text-blue-200">じっくり学習モード</p>
            <p className="text-sm text-blue-300 mt-2">ヒント機能あり・時間制限なし</p>
          </button>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-8 rounded-xl shadow-xl">
            <Trophy className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">タイムアタック</h2>
            <p className="text-orange-200 mb-4">6問ランダム出題</p>

            <div className="space-y-2">
              <button
                onClick={() => onSelectTimeAttack('beginner')}
                className="w-full bg-gray-800 bg-opacity-20 hover:bg-gray-700 hover:bg-opacity-30 py-3 rounded-lg font-bold transition transform hover:scale-105"
              >
                初心者コース
              </button>
              <button
                onClick={() => onSelectTimeAttack('intermediate')}
                className="w-full bg-gray-800 bg-opacity-20 hover:bg-gray-700 hover:bg-opacity-30 py-3 rounded-lg font-bold transition transform hover:scale-105"
              >
                中級者コース
              </button>
              <button
                onClick={() => onSelectTimeAttack('advanced')}
                className="w-full bg-gray-800 bg-opacity-20 hover:bg-gray-700 hover:bg-opacity-30 py-3 rounded-lg font-bold transition transform hover:scale-105"
              >
                上級者コース
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
