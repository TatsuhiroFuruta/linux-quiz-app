import React, { useState } from 'react';
import { HomePage } from './components/HomePage';
import { PracticeMode } from './components/PracticeMode';
import { TimeAttackMode } from './components/TimeAttackMode';
import type { Mode, Level } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('home');
  const [timeAttackLevel, setTimeAttackLevel] = useState<Level>('beginner');

  const handleSelectPractice = () => {
    setMode('practice');
  };

  const handleSelectTimeAttack = (level: Level) => {
    setTimeAttackLevel(level);
    setMode('timeattack');
  };

  const handleGoHome = () => {
    setMode('home');
  };

  const handleRetryTimeAttack = () => {
    // 同じレベルで再スタート
    setMode('home');
    setTimeout(() => {
      setMode('timeattack');
    }, 0);
  };

  if (mode === 'home') {
    return (
      <HomePage
        onSelectPractice={handleSelectPractice}
        onSelectTimeAttack={handleSelectTimeAttack}
      />
    );
  }

  if (mode === 'practice') {
    return <PracticeMode onGoHome={handleGoHome} />;
  }

  if (mode === 'timeattack') {
    return (
      <TimeAttackMode
        level={timeAttackLevel}
        onGoHome={handleGoHome}
        onRetry={handleRetryTimeAttack}
      />
    );
  }

  return null;
};

export default App;
