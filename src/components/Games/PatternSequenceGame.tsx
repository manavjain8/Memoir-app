import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Clock, CheckCircle, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameSession } from '../../types';

interface PatternSequenceGameProps {
  onBack: () => void;
}

export function PatternSequenceGame({ onBack }: PatternSequenceGameProps) {
  const { state, dispatch } = useApp();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(240);
  const [gameStarted, setGameStarted] = useState(false);
  const [showPattern, setShowPattern] = useState(false);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [gamePattern, setGamePattern] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [gameComplete, setGameComplete] = useState(false);
  const [highlightedColor, setHighlightedColor] = useState<number | null>(null);

  const colors = ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'];
  const colorNames = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink'];

  const maxLevels = {
    easy: 5,
    medium: 8,
    hard: 12
  };

  const patternSpeed = {
    easy: 1500,
    medium: 1000,
    hard: 750
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
    if (gameStarted && currentLevel <= maxLevels[difficulty]) {
      generateNewPattern();
    } else if (currentLevel > maxLevels[difficulty]) {
      setGameComplete(true);
      endGame();
    }
  }, [currentLevel, gameStarted, difficulty]);

  const generateNewPattern = () => {
    const baseLength = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
    const patternLength = Math.min(baseLength + Math.floor(currentLevel / 2), 8);
    const newPattern = Array.from({ length: patternLength }, () => 
      Math.floor(Math.random() * colors.length)
    );
    setGamePattern(newPattern);
    setUserSequence([]);
    setIsPlaying(false);
    setFeedback('');
    
    // Show pattern with highlights
    showPatternSequence(newPattern);
  };

  const showPatternSequence = async (pattern: number[]) => {
    setShowPattern(true);
    
    for (let i = 0; i < pattern.length; i++) {
      await new Promise(resolve => setTimeout(resolve, patternSpeed[difficulty]));
      setHighlightedColor(pattern[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
      setHighlightedColor(null);
    }
    
    setShowPattern(false);
    setIsPlaying(true);
  };

  const handleColorClick = (colorIndex: number) => {
    if (!isPlaying) return;

    const newUserSequence = [...userSequence, colorIndex];
    setUserSequence(newUserSequence);

    // Check if the sequence matches so far
    const isCorrectSoFar = newUserSequence.every((color, index) => 
      color === gamePattern[index]
    );

    if (!isCorrectSoFar) {
      // Wrong sequence
      setFeedback('Oops! Try again.');
      setIsPlaying(false);
      setTimeout(() => {
        setUserSequence([]);
        showPatternSequence(gamePattern);
        setFeedback('');
      }, 1500);
    } else if (newUserSequence.length === gamePattern.length) {
      // Complete and correct sequence
      setFeedback('Perfect! Well done! 🎉');
      // Reasonable scoring: 5-20 points per level
      const points = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 20;
      setScore(score + (currentLevel * points));
      setIsPlaying(false);
      
      setTimeout(() => {
        setCurrentLevel(currentLevel + 1);
      }, 2000);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentLevel(1);
    setScore(0);
    setGameComplete(false);
    setTimeLeft(difficulty === 'easy' ? 300 : difficulty === 'medium' ? 240 : 180);
    setShowPattern(false);
    setUserSequence([]);
    setGamePattern([]);
    setIsPlaying(false);
    setFeedback('');
    setHighlightedColor(null);
  };

  const endGame = () => {
    if (state.currentUser && score > 0) {
      const session: GameSession = {
        id: Date.now().toString(),
        gameType: 'pattern-sequence',
        difficulty,
        score,
        completedAt: new Date(),
        userId: state.currentUser.id,
        duration: (difficulty === 'easy' ? 300 : difficulty === 'medium' ? 240 : 180) - timeLeft,
      };
      dispatch({ type: 'ADD_GAME_SESSION', payload: session });
    }
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setTimeLeft(240);
    setGameStarted(false);
    setGameComplete(false);
    setShowPattern(false);
    setUserSequence([]);
    setGamePattern([]);
    setIsPlaying(false);
    setFeedback('');
    setHighlightedColor(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentLevel / maxLevels[difficulty]) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
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
              <span className="font-semibold">{score}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">{formatTime(timeLeft)}</span>
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
            Pattern Sequence
          </h1>
          <p className="text-gray-600 text-lg">
            Watch the pattern carefully, then repeat it by clicking the colors in the same order.
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
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-lg'
                      : 'border-gray-200 hover:border-green-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <Settings className="w-8 h-8 mx-auto mb-3 text-current" />
                    <h4 className="text-xl font-bold capitalize mb-2">{level}</h4>
                    <p className="text-sm opacity-75">
                      {level === 'easy' && '5 levels, slower pace'}
                      {level === 'medium' && '8 levels, medium pace'}
                      {level === 'hard' && '12 levels, fast pace'}
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
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-2xl p-8 mb-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Amazing! You completed all levels! 🎉</h2>
            <p className="text-green-700 mb-6 text-lg">
              You reached level {currentLevel - 1}! Final Score: <span className="font-bold">{score}</span>
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
            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Level Progress</h3>
                <span className="text-sm text-gray-600">Level {currentLevel}/{maxLevels[difficulty]}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Game Status */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-green-600">{currentLevel}</p>
                  <p className="text-sm text-gray-600">Level</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{gamePattern.length}</p>
                  <p className="text-sm text-gray-600">Pattern Length</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{score}</p>
                  <p className="text-sm text-gray-600">Score</p>
                </div>
              </div>

              {/* Status Message */}
              <div className="text-center">
                {showPattern && (
                  <p className="text-lg font-semibold text-blue-600">
                    Watch the pattern carefully! ✨
                  </p>
                )}
                {isPlaying && (
                  <p className="text-lg font-semibold text-green-600">
                    Now repeat the pattern by clicking the colors!
                  </p>
                )}
                {feedback && (
                  <p className={`text-lg font-semibold ${
                    feedback.includes('Perfect') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {feedback}
                  </p>
                )}
              </div>
            </div>

            {/* Pattern Display */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                {showPattern ? 'Pattern to Remember' : 'Click the Colors in Order'}
              </h3>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => handleColorClick(index)}
                    disabled={!isPlaying}
                    className={`w-20 h-20 rounded-xl transition-all transform hover:scale-105 ${color} ${
                      highlightedColor === index
                        ? 'ring-4 ring-white shadow-2xl scale-110'
                        : ''
                    } ${
                      userSequence.includes(index) && isPlaying
                        ? 'ring-4 ring-gray-400'
                        : ''
                    } ${
                      !isPlaying ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                    }`}
                  >
                    <span className="text-white font-semibold text-sm">
                      {colorNames[index]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Progress */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Sequence</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {userSequence.map((colorIndex, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-lg ${colors[colorIndex]} flex items-center justify-center`}
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                ))}
                {Array.from({ length: gamePattern.length - userSequence.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300"
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Time's Up */}
        {timeLeft === 0 && gameStarted && !gameComplete && (
          <div className="bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300 rounded-2xl p-8 mt-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-red-800 mb-4">Time's Up!</h2>
            <p className="text-red-700 mb-6 text-lg">
              You reached level {currentLevel}! Final Score: <span className="font-bold">{score}</span>
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