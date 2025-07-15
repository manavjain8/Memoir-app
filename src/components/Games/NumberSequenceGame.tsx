import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Clock, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameSession } from '../../types';

interface NumberSequenceGameProps {
  onBack: () => void;
}

export function NumberSequenceGame({ onBack }: NumberSequenceGameProps) {
  const { state, dispatch } = useApp();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [level, setLevel] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);

  const maxLevels = {
    easy: 8,
    medium: 12,
    hard: 16
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
      generateSequence();
    } else if (level > maxLevels[difficulty]) {
      setGameComplete(true);
      endGame();
    }
  }, [level, gameStarted, difficulty]);

  const generateSequence = () => {
    let sequence: number[] = [];
    
    switch (difficulty) {
      case 'easy':
        // Simple arithmetic sequences (add 2, add 3, etc.)
        const start = Math.floor(Math.random() * 10) + 1;
        const step = Math.floor(Math.random() * 3) + 2;
        sequence = [start, start + step, start + 2*step, start + 3*step];
        break;
        
      case 'medium':
        // Fibonacci-like or multiplication sequences
        if (Math.random() > 0.5) {
          // Fibonacci-like
          const a = Math.floor(Math.random() * 5) + 1;
          const b = Math.floor(Math.random() * 5) + 1;
          sequence = [a, b, a + b, a + 2*b];
        } else {
          // Multiplication
          const base = Math.floor(Math.random() * 4) + 2;
          const mult = Math.floor(Math.random() * 3) + 2;
          sequence = [base, base * mult, base * mult * mult, base * mult * mult * mult];
        }
        break;
        
      case 'hard':
        // Complex patterns (squares, cubes, mixed operations)
        const patternType = Math.floor(Math.random() * 3);
        if (patternType === 0) {
          // Squares
          const start = Math.floor(Math.random() * 3) + 2;
          sequence = [start*start, (start+1)*(start+1), (start+2)*(start+2), (start+3)*(start+3)];
        } else if (patternType === 1) {
          // Powers of 2
          const exp = Math.floor(Math.random() * 3) + 1;
          sequence = [Math.pow(2, exp), Math.pow(2, exp+1), Math.pow(2, exp+2), Math.pow(2, exp+3)];
        } else {
          // Mixed operations
          const a = Math.floor(Math.random() * 5) + 2;
          sequence = [a, a*2+1, a*4+3, a*8+7];
        }
        break;
    }
    
    setCurrentSequence(sequence);
    setUserAnswer('');
    setFeedback('');
  };

  const checkAnswer = () => {
    const answer = parseInt(userAnswer);
    if (isNaN(answer)) return;

    let nextNumber = 0;
    const seq = currentSequence;
    
    // Calculate expected next number based on pattern
    if (difficulty === 'easy') {
      const diff = seq[1] - seq[0];
      nextNumber = seq[seq.length - 1] + diff;
    } else if (difficulty === 'medium') {
      // Check if it's arithmetic, fibonacci-like, or multiplication
      const diff1 = seq[1] - seq[0];
      const diff2 = seq[2] - seq[1];
      const diff3 = seq[3] - seq[2];
      
      if (diff1 === diff2 && diff2 === diff3) {
        // Arithmetic
        nextNumber = seq[seq.length - 1] + diff1;
      } else if (seq[2] === seq[0] + seq[1]) {
        // Fibonacci-like
        nextNumber = seq[2] + seq[3];
      } else {
        // Multiplication
        const ratio = seq[1] / seq[0];
        nextNumber = Math.round(seq[seq.length - 1] * ratio);
      }
    } else {
      // Hard patterns
      if (seq[1] === (Math.sqrt(seq[0]) + 1) ** 2) {
        // Squares
        const nextRoot = Math.sqrt(seq[seq.length - 1]) + 1;
        nextNumber = nextRoot * nextRoot;
      } else if (seq[1] === seq[0] * 2) {
        // Powers of 2
        nextNumber = seq[seq.length - 1] * 2;
      } else {
        // Mixed operations pattern
        const base = (seq[0] - 0) / 1;
        const step = level + 3;
        nextNumber = base * Math.pow(2, step) + (Math.pow(2, step) - 1);
      }
    }

    if (Math.abs(answer - nextNumber) <= 1) { // Allow small rounding errors
      setFeedback('Correct! Well done! 🎉');
      const points = difficulty === 'easy' ? 25 : difficulty === 'medium' ? 50 : 75;
      setScore(score + points * level);
      setTimeout(() => {
        setLevel(level + 1);
      }, 2000);
    } else {
      setFeedback(`Not quite. The answer was ${nextNumber}. Try the next one!`);
      setTimeout(() => {
        setLevel(level + 1);
      }, 3000);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setLevel(1);
    setScore(0);
    setGameComplete(false);
    setTimeLeft(difficulty === 'easy' ? 420 : difficulty === 'medium' ? 300 : 240);
  };

  const endGame = () => {
    if (state.currentUser && score > 0) {
      const session: GameSession = {
        id: Date.now().toString(),
        gameType: 'number-sequence',
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
    setGameComplete(false);
    setCurrentSequence([]);
    setUserAnswer('');
    setFeedback('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Activities</span>
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-gray-800 dark:text-white">{score}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-semibold text-gray-800 dark:text-white">{formatTime(timeLeft)}</span>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Number Sequence
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Find the pattern and complete the number sequence
          </p>
        </div>

        {/* Difficulty Selection */}
        {!gameStarted && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">Choose Difficulty</h3>
            <div className="grid grid-cols-3 gap-4">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    difficulty === level
                      ? 'border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-300 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <Settings className="w-8 h-8 mx-auto mb-3 text-current" />
                    <h4 className="text-xl font-bold capitalize mb-2">{level}</h4>
                    <p className="text-sm opacity-75">
                      {level === 'easy' && 'Simple arithmetic patterns'}
                      {level === 'medium' && 'Fibonacci & multiplication'}
                      {level === 'hard' && 'Complex mathematical patterns'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Complete */}
        {gameComplete && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 border-2 border-green-300 dark:border-green-600 rounded-2xl p-8 mb-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-4">Excellent! You completed all levels! 🎉</h2>
            <p className="text-green-700 dark:text-green-400 mb-6 text-lg">
              Final Score: <span className="font-bold">{score}</span>
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
            {/* Level Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Level {level}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">{level}/{maxLevels[difficulty]}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(level / maxLevels[difficulty]) * 100}%` }}
                />
              </div>
            </div>

            {/* Sequence Display */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 mb-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
                What comes next in this sequence?
              </h3>
              
              <div className="flex items-center justify-center space-x-4 mb-8">
                {currentSequence.map((num, index) => (
                  <div
                    key={index}
                    className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  >
                    {num}
                  </div>
                ))}
                <div className="text-3xl text-gray-400 dark:text-gray-500">→</div>
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 font-bold text-xl">
                  ?
                </div>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-32 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-center text-xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="?"
                />
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim()}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-lg transition-all disabled:cursor-not-allowed font-semibold"
                >
                  Check Answer
                </button>
              </div>

              {feedback && (
                <div className={`mt-6 text-center text-lg font-semibold ${
                  feedback.includes('Correct') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {feedback}
                </div>
              )}
            </div>

            {/* Game Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Game Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{level}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Level</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{difficulty}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Difficulty</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Time's Up */}
        {timeLeft === 0 && gameStarted && !gameComplete && (
          <div className="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 border-2 border-red-300 dark:border-red-600 rounded-2xl p-8 mt-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-red-800 dark:text-red-300 mb-4">Time's Up!</h2>
            <p className="text-red-700 dark:text-red-400 mb-6 text-lg">
              You reached level {level}! Final Score: <span className="font-bold">{score}</span>
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