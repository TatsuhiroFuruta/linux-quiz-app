import React, { useState, useEffect } from 'react';
import { Terminal, Home, Clock } from 'lucide-react';
import { QuestionDisplay } from './QuestionDisplay';
import { TimeAttackResult } from './TimeAttackResult';
import { simulateCommand } from '../utils/commandSimulator';
import { validateCommand } from '../utils/commandValidator';
import { formatTime, getLevelText } from '../utils/formatters';
import { questions } from '../data/questions';
import type { Level, Score, Question } from '../types';

interface TimeAttackModeProps {
  level: Level;
  onGoHome: () => void;
  onRetry: () => void;
}

// ランダムに6問選択する関数（コンポーネント外に定義）
const selectRandomQuestions = (level: Level): Question[] => {
  const allQuestions: Question[] = [];
  Object.values(questions).forEach(cmdQuestions => {
    allQuestions.push(...cmdQuestions[level]);
  });

  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
};

export const TimeAttackMode: React.FC<TimeAttackModeProps> = ({ level, onGoHome, onRetry }) => {
  // useStateの初期値として問題を生成（初回レンダリング時のみ実行）
  const [timeAttackQuestions] = useState<Question[]>(() => selectRandomQuestions(level));
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 });
  const [commandOutput, setCommandOutput] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // タイマー
  useEffect(() => {
    let interval: number;
    if (isActive && !isFinished) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isFinished]);

  const currentQ = timeAttackQuestions[currentQuestion];

  const checkAnswer = () => {
    const isCorrect = validateCommand(userAnswer.trim(), currentQ.answer, currentQ.file);

    // 正解の場合のみコマンドの出力結果を表示
    let output = '';
    if (isCorrect) {
      output = simulateCommand(
        userAnswer.includes('|') ? userAnswer.split('|')[1].trim() : userAnswer,
        currentQ.data
      );
    }

    setCommandOutput(output);
    setResult(isCorrect);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < timeAttackQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer('');
      setResult(null);
      setCommandOutput('');
    } else {
      setIsActive(false);
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const finalScore = score.correct;
    const finalTotal = score.total;

    return (
      <TimeAttackResult
        level={level}
        timeElapsed={timeElapsed}
        correctCount={finalScore}
        totalCount={finalTotal}
        onRetry={onRetry}
        onGoHome={onGoHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Terminal className="w-10 h-10 text-green-400" />
            <h1 className="text-3xl font-bold">タイムアタック</h1>
          </div>
          <button
            onClick={onGoHome}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            ホーム
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <span className="text-2xl font-bold">{formatTime(timeElapsed)}</span>
          </div>
          <div className="text-lg">
            <span className="text-gray-400">レベル: </span>
            <span className="font-bold">{getLevelText(level)}</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl">
          <div className="mb-6">
            <div className="bg-gray-700 border border-gray-600 rounded px-4 py-2 flex justify-between items-center">
              <span className="text-lg font-medium">スコア</span>
              <span className="text-2xl font-bold">{score.correct} / {score.total}</span>
            </div>
          </div>

          <QuestionDisplay
            question={currentQ}
            currentQuestionNumber={currentQuestion + 1}
            totalQuestions={timeAttackQuestions.length}
            userAnswer={userAnswer}
            result={result}
            showHint={false}
            commandOutput={commandOutput}
            isPracticeMode={false}
            onAnswerChange={setUserAnswer}
            onSubmit={checkAnswer}
            onToggleHint={() => {}}
            onNext={nextQuestion}
          />
        </div>
      </div>
    </div>
  );
};
