// 問題の型定義
export interface Question {
  title: string;
  data: string;
  task: string;
  answer: string | string[];  // 単一の正解または複数の正解
  hint: string;
  explanation: string;
  file: string;
}

// 問題データ全体の型定義
export interface Questions {
  [key: string]: {
    [key: string]: Question[];
  };
}

// スコアの型定義
export interface Score {
  correct: number;
  total: number;
}

// レベルの型定義
export type Level = 'beginner' | 'intermediate' | 'advanced';

// コマンドタイプの型定義
export type CommandType = 'grep' | 'sed' | 'awk';

// モードの型定義
export type Mode = 'home' | 'practice' | 'timeattack';
