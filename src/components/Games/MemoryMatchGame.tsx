import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Clock, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameSession } from '../../types';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  onBack: () => void;
}

export function MemoryMatchGame({ onBack }: MemoryMatchGameProps) {
  const { state, dispatch } = useApp();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Multiple emoji sets for variety
  const emojiSets = {
    easy: [
      ['🐶', '🐱', '🐭', '🐹'],
      ['🍎', '🍌', '🍊', '🍇'],
      ['⭐', '🌙', '☀️', '🌈'],
      ['🚗', '🚲', '✈️', '🚢']
    ],
    medium: [
      ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
      ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝'],
      ['⭐', '🌙', '☀️', '🌈', '⚡', '🔥'],
      ['🚗', '🚲', '✈️', '🚢', '🚂', '🚁']
    ],
    hard: [
      ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
      ['🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🥭', '🍑'],
      ['⭐', '🌙', '☀️', '🌈', '⚡', '🔥', '❄️', '🌊'],
      ['🚗', '🚲', '✈️', '🚢', '🚂', '🚁', '🚀', '🛸']
    ]
  };

  const [currentEmojiSet, setCurrentEmojiSet] = useState<string[]>([]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [gameStarted, timeLeft, gameComplete]);

  useEffect(() => {
    if (flippedCards.length === 2 && !isProcessing) {
      setIsProcessing(true);
      const [first, second] = flippedCards;
      const firstCard = cards.find(card => card.id === first);
      const secondCard = cards.find(card => card.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          ));
          // Reasonable scoring: 5-15 points per match
          const points = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
          setScore(score + points);
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      } else {
        // No match - flip cards back
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
      setMoves(moves + 1);
    }
  }, [flippedCards, cards, score, moves, difficulty, isProcessing]);

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched) && gameStarted) {
      setGameComplete(true);
      // Time bonus: 1 point per remaining second
      const timeBonus = timeLeft;
      setScore(score + timeBonus);
      endGame();
    }
  }, [cards, gameStarted, score, timeLeft]);

  const initializeGame = () => {
    // Select random emoji set for variety
    const availableSets = emojiSets[difficulty];
    const randomSet = availableSets[Math.floor(Math.random() * availableSets.length)];
    setCurrentEmojiSet(randomSet);
    
    const gameCards: Card[] = [];
    randomSet.forEach((emoji, index) => {
      gameCards.push(
        { id: index * 2, emoji, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, emoji, isFlipped: false, isMatched: false }
      );
    });
    
    // Shuffle cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }
    
    setCards(gameCards);
  };

  const handleCardClick = (cardId: number) => {
    if (isProcessing || flippedCards.length === 2) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));
    setFlippedCards(prev => [...prev, cardId]);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setMoves(0);
    setGameComplete(false);
    setFlippedCards([]);
    setIsProcessing(false);
    setTimeLeft(difficulty === 'easy' ? 240 : difficulty === 'medium' ? 180 : 120);
    initializeGame();
  };

  const endGame = () => {
    if (state.currentUser && score > 0) {
      const session: GameSession = {
        id: Date.now().toString(),
        gameType: 'memory-match',
        difficulty,
        score,
        completedAt: new Date(),
        userId: state.currentUser.id,
        duration: (difficulty === 'easy' ? 240 : difficulty === 'medium' ? 180 : 120) - timeLeft,
      };
      dispatch({ type: 'ADD_GAME_SESSION', payload: session });
    }
  };

  const resetGame = () => {
    setScore(0);
    setMoves(0);
    setTimeLeft(180);
    setGameStarted(false);
    setGameComplete(false);
    setFlippedCards([]);
    setIsProcessing(false);
    setCurrentEmojiSet([]);
    initializeGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = cards.length > 0 ? (cards.filter(card => card.isMatched).length / cards.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Memory Match
          </h1>
          <p className="text-gray-600 text-lg">
            Find matching pairs by flipping cards. Remember where each symbol is!
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
                      ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-lg'
                      : 'border-gray-200 hover:border-pink-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <Settings className="w-8 h-8 mx-auto mb-3 text-current" />
                    <h4 className="text-xl font-bold capitalize mb-2">{level}</h4>
                    <p className="text-sm opacity-75">
                      {level === 'easy' && '8 cards, 4 minutes'}
                      {level === 'medium' && '12 cards, 3 minutes'}
                      {level === 'hard' && '16 cards, 2 minutes'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Complete */}
        {gameComplete && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-2xl p-8 mb-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Excellent Memory! 🎉</h2>
            <p className="text-green-700 mb-6 text-lg">
              You matched all pairs in {moves} moves! Final Score: <span className="font-bold">{score}</span>
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
                <h3 className="text-lg font-semibold text-gray-800">Progress</h3>
                <span className="text-sm text-gray-600">
                  {cards.filter(card => card.isMatched).length / 2}/{currentEmojiSet.length} pairs
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-pink-400 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-pink-600">{moves}</p>
                  <p className="text-sm text-gray-600">Moves</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {cards.filter(card => card.isMatched).length / 2}
                  </p>
                  <p className="text-sm text-gray-600">Pairs Found</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{score}</p>
                  <p className="text-sm text-gray-600">Score</p>
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className={`grid gap-4 ${
              difficulty === 'easy' ? 'grid-cols-4' : 
              difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-4'
            }`}>
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isFlipped || card.isMatched || isProcessing}
                  className={`aspect-square rounded-xl text-4xl font-bold transition-all transform hover:scale-105 ${
                    card.isFlipped || card.isMatched
                      ? 'bg-white border-2 border-pink-300 shadow-lg'
                      : 'bg-gradient-to-br from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 shadow-md text-white'
                  } ${
                    card.isMatched ? 'ring-4 ring-green-300' : ''
                  } ${
                    isProcessing ? 'cursor-not-allowed' : ''
                  }`}
                >
                  {card.isFlipped || card.isMatched ? card.emoji : '?'}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Time's Up */}
        {timeLeft === 0 && gameStarted && !gameComplete && (
          <div className="bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300 rounded-2xl p-8 mt-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-red-800 mb-4">Time's Up!</h2>
            <p className="text-red-700 mb-6 text-lg">
              You found {cards.filter(card => card.isMatched).length / 2} pairs. Final Score: <span className="font-bold">{score}</span>
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