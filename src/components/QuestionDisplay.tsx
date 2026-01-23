import React from 'react';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import type { Question } from '../types';

interface QuestionDisplayProps {
  question: Question;
  currentQuestionNumber: number;
  totalQuestions: number;
  userAnswer: string;
  result: boolean | null;
  showHint: boolean;
  commandOutput: string;
  isPracticeMode: boolean;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onToggleHint: () => void;
  onNext: () => void;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  currentQuestionNumber,
  totalQuestions,
  userAnswer,
  result,
  showHint,
  commandOutput,
  isPracticeMode,
  onAnswerChange,
  onSubmit,
  onToggleHint,
  onNext,
}) => {
  return (
    <div className="bg-gray-900 rounded p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-green-400">
          問題 {currentQuestionNumber} / {totalQuestions}
        </h3>
        <span className="text-sm text-gray-400">{question.title}</span>
      </div>
      <p className="text-yellow-300 mb-3">{question.task}</p>

      <div className="bg-black rounded p-3 mb-3 font-mono text-sm overflow-x-auto">
        <div className="text-gray-400 mb-1"># ファイル: {question.file}</div>
        <pre className="text-green-300 whitespace-pre">{question.data}</pre>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-2">コマンドを入力してください:</label>
        <div className="flex gap-2">
          <div className="flex-1 bg-black rounded p-3 font-mono text-sm flex items-center">
            <span className="text-gray-400 mr-2">$</span>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => onAnswerChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && result === null && onSubmit()}
              placeholder={`cat ${question.file} | コマンド ...`}
              className="flex-1 bg-transparent outline-none text-green-300"
              disabled={result !== null}
            />
          </div>
        </div>
      </div>

      {result === null && (
        <div className="flex gap-2 mb-3">
          <button
            onClick={onSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            実行
          </button>
          {isPracticeMode && (
            <button
              onClick={onToggleHint}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              ヒント
            </button>
          )}
        </div>
      )}

      {showHint && result === null && isPracticeMode && (
        <div className="bg-yellow-900 border border-yellow-600 rounded p-3 mb-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-100">{question.hint}</p>
          </div>
        </div>
      )}

      {commandOutput && (
        <div className="bg-black rounded p-3 mb-3 font-mono text-sm overflow-x-auto">
          <div className="text-gray-400 mb-1"># 実行結果:</div>
          <pre className="text-cyan-300 whitespace-pre">{commandOutput || '(出力なし)'}</pre>
        </div>
      )}

      {result !== null && (
        <div className={`rounded p-4 mb-3 ${result ? 'bg-green-900 border border-green-600' : 'bg-red-900 border border-red-600'}`}>
          <div className="flex items-start gap-2 mb-2">
            {result ? (
              <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-300 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-bold mb-1">
                {result ? '正解です！' : '不正解です'}
              </p>
              {!result && (
                <div>
                  <p className="text-sm mb-1">正解例: <code className="bg-black bg-opacity-50 px-2 py-1 rounded">{question.answer}</code></p>
                  <p className="text-sm mb-1">または: <code className="bg-black bg-opacity-50 px-2 py-1 rounded">{question.answer} {question.file}</code></p>
                </div>
              )}
              <p className="text-sm mt-2">{question.explanation}</p>
            </div>
          </div>
          <button
            onClick={onNext}
            className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-bold py-2 px-4 rounded transition mt-2"
          >
            {currentQuestionNumber < totalQuestions ? '次の問題へ' : '結果を見る'}
          </button>
        </div>
      )}
    </div>
  );
};
