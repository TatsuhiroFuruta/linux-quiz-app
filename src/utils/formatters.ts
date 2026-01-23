// 時間を mm:ss 形式にフォーマット
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// レベルを日本語に変換
export const getLevelText = (level: 'beginner' | 'intermediate' | 'advanced'): string => {
  switch (level) {
    case 'beginner':
      return '初心者';
    case 'intermediate':
      return '中級者';
    case 'advanced':
      return '上級者';
  }
};
