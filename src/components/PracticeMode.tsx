import React, { useState } from 'react';
import { Terminal, Home } from 'lucide-react';
import { QuestionDisplay } from './QuestionDisplay';
import { simulateCommand } from '../utils/commandSimulator';
import { validateCommand } from '../utils/commandValidator';
import { questions } from '../data/questions';
import type { Level, CommandType, Score } from '../types';

interface PracticeModeProps {
  onGoHome: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ onGoHome }) => {
  const [level, setLevel] = useState<Level>('beginner');
  const [commandType, setCommandType] = useState<CommandType>('grep');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [result, setResult] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 });
  const [commandOutput, setCommandOutput] = useState<string>('');

  const currentQuestions = questions[commandType][level];
  const currentQ = currentQuestions[currentQuestion];

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswer('');
    setResult(null);
    setShowHint(false);
    setScore({ correct: 0, total: 0 });
    setCommandOutput('');
  };

  const handleLevelChange = (newLevel: Level) => {
    setLevel(newLevel);
    resetQuiz();
  };

  const handleCommandTypeChange = (newType: CommandType) => {
    setCommandType(newType);
    resetQuiz();
  };

  const checkAnswer = () => {
    const isCorrect = validateCommand(userAnswer.trim(), currentQ.answer, currentQ.file);
    const output = simulateCommand(
      userAnswer.includes('|') ? userAnswer.split('|')[1].trim() : userAnswer,
      currentQ.data
    );

    setCommandOutput(output);
    setResult(isCorrect);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setUserAnswer('');
      setResult(null);
      setShowHint(false);
      setCommandOutput('');
    } else {
      alert(`お疲れ様でした！スコア: ${score.correct + (result ? 1 : 0)}/${score.total}`);
      resetQuiz();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Terminal className="w-10 h-10 text-green-400" />
            <h1 className="text-3xl font-bold">Linux コマンド練習</h1>
          </div>
          <button
            onClick={onGoHome}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            ホーム
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">レベル</label>
              <select
                value={level}
                onChange={(e) => handleLevelChange(e.target.value as Level)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">初心者</option>
                <option value="intermediate">中級者</option>
                <option value="advanced">上級者</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">コマンド</label>
              <select
                value={commandType}
                onChange={(e) => handleCommandTypeChange(e.target.value as CommandType)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="grep">grep</option>
                <option value="sed">sed</option>
                <option value="awk">awk</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">スコア</label>
              <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-center font-bold">
                {score.correct} / {score.total}
              </div>
            </div>
          </div>

          <QuestionDisplay
            question={currentQ}
            currentQuestionNumber={currentQuestion + 1}
            totalQuestions={currentQuestions.length}
            userAnswer={userAnswer}
            result={result}
            showHint={showHint}
            commandOutput={commandOutput}
            isPracticeMode={true}
            onAnswerChange={setUserAnswer}
            onSubmit={checkAnswer}
            onToggleHint={() => setShowHint(!showHint)}
            onNext={nextQuestion}
          />
        </div>

        <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300">
          <h4 className="font-semibold mb-2">💡 使い方</h4>
          <ul className="space-y-1">
            <li>• レベルとコマンドを選択してクイズに挑戦</li>
            <li>• <code className="bg-gray-700 px-1 rounded">cat file.txt | grep pattern</code> または <code className="bg-gray-700 px-1 rounded">grep pattern file.txt</code> の両方の形式で入力可能</li>
            <li>• わからない場合は「ヒント」ボタンをクリック</li>
            <li>• 実行後にコマンドの出力結果が表示されます</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
