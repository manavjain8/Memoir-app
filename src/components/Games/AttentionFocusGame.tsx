import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Clock, Settings, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameSession } from '../../types';

interface AttentionFocusGameProps {
  onBack: () => void;
}

interface MovingTarget {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  isTarget: boolean;
}

export function AttentionFocusGame({ onBack }: AttentionFocusGameProps) {
  const { state, dispatch } = useApp();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const [targets, setTargets] = useState<MovingTarget[]>([]);
  const [level, setLevel] = useState(1);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const maxLevels = {
    easy: 10,
    medium: 15,
    hard: 20
  };

  const speeds = {
    easy: 1,
    medium: 2,
    hard: 3
  };

  const targetCounts = {
    easy: { total: 4, targets: 2 },
    medium: { total: 6, targets: 3 },
    hard: { total: 8, targets: 4 }
  };

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [gameStarted, timeLeft, gameComplete]);

  useEffect(() => {
    if (gameStarted && level <= maxLevels[difficulty]) {
      generateTargets();
    } else if (level > maxLevels[difficulty]) {
      setGameComplete(true);
      endGame();
    }
  }, [level, gameStarted, difficulty]);

  useEffect(() => {
    if (gameStarted && !gameComplete) {
      const interval = setInterval(() => {
        setTargets(prevTargets => 
          prevTargets.map(target => {
            let newX = target.x + target.dx * speeds[difficulty];
            let newY = target.y + target.dy * speeds[difficulty];
            let newDx = target.dx;
            let newDy = target.dy;

            // Bounce off walls
            if (newX <= 0 || newX >= 580) {
              newDx = -newDx;
              newX = Math.max(0, Math.min(580, newX));
            }
            if (newY <= 0 || newY >= 380) {
              newDy = -newDy;
              newY = Math.max(0, Math.min(380, newY));
            }

            return { ...target, x: newX, y: newY, dx: newDx, dy: newDy };
          })
        );
      }, 50);

      return () => clearInterval(interval);
    }
  }, [gameStarted, gameComplete, difficulty]);

  const generateTargets = () => {
    const newTargets: MovingTarget[] = [];
    const config = targetCounts[difficulty];
    const targetCount = Math.min(level + 1, config.targets);

    // Create targets (red ones to click)
    for (let i = 0; i < targetCount; i++) {
      newTargets.push({
        id: i,
        x: Math.random() * 500 + 40,
        y: Math.random() * 300 + 40,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        color: '#ef4444',
        isTarget: true
      });
    }

    // Create distractors (gray ones to avoid)
    const distractorCount = config.total - targetCount;
    for (let i = 0; i < distractorCount; i++) {
      newTargets.push({
        id: targetCount + i,
        x: Math.random() * 500 + 40,
        y: Math.random() * 300 + 40,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        color: '#6b7280',
        isTarget: false
      });
    }

    setTargets(newTargets);
  };

  const handleTargetClick = (target: MovingTarget) => {
    if (target.isTarget) {
      setHits(hits + 1);
      // Reasonable scoring: 3-8 points per hit
      const points = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
      setScore(score + points);
      
      // Remove clicked target
      setTargets(prevTargets => prevTargets.filter(t => t.id !== target.id));
      
      // Check if all targets hit
      const remainingTargets = targets.filter(t => t.isTarget && t.id !== target.id);
      if (remainingTargets.length === 0) {
        setTimeout(() => {
          setLevel(level + 1);
        }, 1000);
      }
    } else {
      setMisses(misses + 1);
      // Small penalty for hitting wrong target
      setScore(Math.max(0, score - 2));
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setLevel(1);
    setScore(0);
    setHits(0);
    setMisses(0);
    setGameComplete(false);
    setTimeLeft(difficulty === 'easy' ? 420 : difficulty === 'medium' ? 300 : 240);
  };

  const endGame = () => {
    if (state.currentUser && score > 0) {
      const session: GameSession = {
        id: Date.now().toString(),
        gameType: 'attention-focus',
        difficulty,
        score,
        completedAt: new Date(),
        userId: state.currentUser.id,
        duration: (difficulty === 'easy' ? 420 : difficulty === 'medium' ? 300 : 240) - timeLeft,
      };
      dispatch({ type: 'ADD_GAME_SESSION', payload: session });
    }
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(300);
    setGameStarted(false);
    setLevel(1);
    setHits(0);
    setMisses(0);
    setGameComplete(false);
    setTargets([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Activities</span>
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-800">{score}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-800">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={resetGame}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Focus Training
          </h1>
          <p className="text-gray-600 text-lg">
            Click only the red targets as they move around the screen. Avoid the gray distractors!
          </p>
        </div>

        {/* Difficulty Selection */}
        {!gameStarted && (
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Difficulty</h3>
            <div className="grid grid-cols-3 gap-4">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    difficulty === level
                      ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 text-gray-700 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <Settings className="w-8 h-8 mx-auto mb-3 text-current" />
                    <h4 className="text-xl font-bold capitalize mb-2">{level}</h4>
                    <p className="text-sm opacity-75">
                      {level === 'easy' && 'Slow movement, 2 targets'}
                      {level === 'medium' && 'Medium speed, 3 targets'}
                      {level === 'hard' && 'Fast movement, 4 targets'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Complete */}
        {gameComplete && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-2xl p-8 mb-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Excellent Focus! 🎯</h2>
            <p className="text-green-700 mb-6 text-lg">
              You completed all levels! Final Score: <span className="font-bold">{score}</span>
            </p>
            <p className="text-green-600 mb-6">
              Accuracy: {accuracy}% ({hits} hits, {misses} misses)
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetGame}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Play Again
              </button>
              <button
                onClick={onBack}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Back to Activities
              </button>
            </div>
          </div>
        )}

        {/* Game Board */}
        {gameStarted && !gameComplete && (
          <>
            {/* Game Stats */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-200">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{level}</p>
                  <p className="text-sm text-gray-600">Level</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{hits}</p>
                  <p className="text-sm text-gray-600">Hits</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{misses}</p>
                  <p className="text-sm text-gray-600">Misses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{accuracy}%</p>
                  <p className="text-sm text-gray-600">Accuracy</p>
                </div>
              </div>
            </div>

            {/* Game Area */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Click the RED targets only!
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Target</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Avoid</span>
                  </div>
                </div>
              </div>
              
              <div 
                className="relative bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden"
                style={{ width: '600px', height: '400px', margin: '0 auto' }}
              >
                {targets.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => handleTargetClick(target)}
                    className="absolute w-8 h-8 rounded-full transition-all transform hover:scale-110 shadow-lg"
                    style={{
                      left: `${target.x}px`,
                      top: `${target.y}px`,
                      backgroundColor: target.color,
                    }}
                  >
                    {target.isTarget && <Target className="w-4 h-4 text-white m-auto" />}
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-gray-600 mt-4 text-center">
                Targets remaining: {targets.filter(t => t.isTarget).length}
              </p>
            </div>
          </>
        )}

        {/* Time's Up */}
        {timeLeft === 0 && gameStarted && !gameComplete && (
          <div className="bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300 rounded-2xl p-8 mt-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-red-800 mb-4">Time's Up!</h2>
            <p className="text-red-700 mb-6 text-lg">
              You reached level {level}! Final Score: <span className="font-bold">{score}</span>
            </p>
            <p className="text-red-600 mb-6">
              Accuracy: {accuracy}% ({hits} hits, {misses} misses)
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetGame}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={onBack}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Back to Activities
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}