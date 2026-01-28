import React from 'react';
import { Trophy, Clock, CheckCircle, Home, Share2 } from 'lucide-react';
import { formatTime } from '../utils/formatters';
import { shareToTwitter } from '../utils/share';
import type { Level } from '../types';

interface TimeAttackResultProps {
  level: Level;
  timeElapsed: number;
  correctCount: number;
  totalCount: number;
  onRetry: () => void;
  onGoHome: () => void;
}

export const TimeAttackResult: React.FC<TimeAttackResultProps> = ({
  level,
  timeElapsed,
  correctCount,
  totalCount,
  onRetry,
  onGoHome,
}) => {
  const accuracy = Math.round((correctCount / totalCount) * 100);

  const handleShare = () => {
    shareToTwitter(level, timeElapsed, correctCount, totalCount);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-gray-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">タイムアタック完了！</h1>
          <p className="text-gray-400">お疲れ様でした</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <Clock className="w-12 h-12 text-blue-400 mx-auto mb-2" />
            <p className="text-gray-400 mb-1">経過時間</p>
            <p className="text-4xl font-bold">{formatTime(timeElapsed)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <p className="text-gray-400 mb-1">正答数</p>
            <p className="text-4xl font-bold">{correctCount} / {totalCount}</p>
            <p className="text-sm text-gray-400 mt-1">正答率: {accuracy}%</p>
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={handleShare}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2 mb-3"
          >
            <Share2 className="w-5 h-5" />
            結果をXでシェア
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onRetry}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg transition"
          >
            もう一度挑戦
          </button>
          <button
            onClick={onGoHome}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            ホームへ
          </button>
        </div>
      </div>
    </div>
  );
};
