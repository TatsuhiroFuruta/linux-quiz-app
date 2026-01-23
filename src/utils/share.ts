import { formatTime, getLevelText } from './formatters';
import type { Level } from '../types';

// タイムアタック結果をXでシェア
export const shareToTwitter = (
  level: Level,
  timeElapsed: number,
  correctCount: number,
  totalCount: number
): void => {
  const levelText = getLevelText(level);
  const accuracy = Math.round((correctCount / totalCount) * 100);

  const text = `Linuxコマンド練習アプリ - タイムアタック結果\n\n` +
               `📊 レベル: ${levelText}\n` +
               `⏱️ タイム: ${formatTime(timeElapsed)}\n` +
               `✅ 正答数: ${correctCount}/${totalCount} (${accuracy}%)\n\n` +
               `#Linuxコマンド練習 #grep_sed_awkをマスターしよう`;

  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};
