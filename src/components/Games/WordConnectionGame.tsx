import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Clock, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameSession } from '../../types';

interface WordConnectionGameProps {
  onBack: () => void;
}

export function WordConnectionGame({ onBack }: WordConnectionGameProps) {
  const { state, dispatch } = useApp();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [completedGroups, setCompletedGroups] = useState<string[][]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [currentWordSet, setCurrentWordSet] = useState<any[]>([]);
  const [staticWordGrid, setStaticWordGrid] = useState<string[]>([]);

  // Multiple word sets for variety
  const wordSets = {
    easy: [
      [
        { category: "Colors", words: ["Red", "Blue", "Green", "Yellow"] },
        { category: "Animals", words: ["Cat", "Dog", "Bird", "Fish"] },
        { category: "Food", words: ["Apple", "Bread", "Milk", "Egg"] }
      ],
      [
        { category: "Shapes", words: ["Circle", "Square", "Triangle", "Star"] },
        { category: "Weather", words: ["Sun", "Rain", "Snow", "Wind"] },
        { category: "Body", words: ["Hand", "Foot", "Head", "Eye"] }
      ],
      [
        { category: "Numbers", words: ["One", "Two", "Three", "Four"] },
        { category: "Days", words: ["Monday", "Tuesday", "Wednesday", "Thursday"] },
        { category: "Months", words: ["January", "February", "March", "April"] }
      ]
    ],
    medium: [
      [
        { category: "Family", words: ["Mother", "Father", "Sister", "Brother"] },
        { category: "Furniture", words: ["Chair", "Table", "Bed", "Sofa"] },
        { category: "Vehicles", words: ["Car", "Bus", "Train", "Bike"] },
        { category: "Fruits", words: ["Apple", "Orange", "Banana", "Grape"] }
      ],
      [
        { category: "Emotions", words: ["Happy", "Sad", "Angry", "Excited"] },
        { category: "Sports", words: ["Soccer", "Tennis", "Swimming", "Running"] },
        { category: "Tools", words: ["Hammer", "Screwdriver", "Wrench", "Saw"] },
        { category: "Clothes", words: ["Shirt", "Pants", "Shoes", "Hat"] }
      ]
    ],
    hard: [
      [
        { category: "Professions", words: ["Doctor", "Teacher", "Engineer", "Artist"] },
        { category: "Instruments", words: ["Piano", "Guitar", "Violin", "Drums"] },
        { category: "Countries", words: ["Canada", "France", "Japan", "Brazil"] },
        { category: "Sciences", words: ["Biology", "Chemistry", "Physics", "Math"] },
        { category: "Emotions", words: ["Euphoric", "Melancholy", "Anxious", "Serene"] }
      ],
      [
        { category: "Literature", words: ["Novel", "Poetry", "Drama", "Essay"] },
        { category: "Architecture", words: ["Gothic", "Modern", "Classical", "Baroque"] },
        { category: "Philosophy", words: ["Ethics", "Logic", "Metaphysics", "Aesthetics"] },
        { category: "Technology", words: ["Algorithm", "Database", "Network", "Interface"] },
        { category: "Medicine", words: ["Diagnosis", "Treatment", "Prevention", "Recovery"] }
      ]
    ]
  };

  const currentGroups = currentWordSet;

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [gameStarted, timeLeft, gameComplete]);

  useEffect(() => {
    if (completedGroups.length === currentGroups.length && gameStarted && currentGroups.length > 0) {
      setGameComplete(true);
      endGame();
    }
  }, [completedGroups, currentGroups.length, gameStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWordClick = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else if (selectedWords.length < 4) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const checkConnection = () => {
    if (selectedWords.length !== 4) return;

    const matchingGroup = currentGroups.find(group => 
      selectedWords.every(word => group.words.includes(word)) &&
      group.words.every(word => selectedWords.includes(word))
    );

    if (matchingGroup) {
      setCompletedGroups([...completedGroups, selectedWords]);
      // Reasonable scoring: 10-25 points per group
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 25;
      setScore(score + points);
      setSelectedWords([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } else {
      setAttempts(attempts + 1);
      setSelectedWords([]);
      // Small penalty for wrong attempts
      setScore(Math.max(0, score - 2));
    }
  };

  const startGame = () => {
    // Select random word set for variety
    const availableSets = wordSets[difficulty];
    const randomSet = availableSets[Math.floor(Math.random() * availableSets.length)];
    setCurrentWordSet(randomSet);
    
    // Create STATIC grid - words never move from these positions
    const allWords = randomSet.flatMap(group => group.words);
    // Shuffle once and keep in these positions
    const shuffledWords = [...allWords];
    for (let i = shuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
    }
    setStaticWordGrid(shuffledWords);
    
    setGameStarted(true);
    setScore(0);
    setCompletedGroups([]);
    setSelectedWords([]);
    setAttempts(0);
    setGameComplete(false);
    setTimeLeft(difficulty === 'easy' ? 420 : difficulty === 'medium' ? 300 : 240);
  };

  const endGame = () => {
    if (state.currentUser && score > 0) {
      const session: GameSession = {
        id: Date.now().toString(),
        gameType: 'word-connections',
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
    setSelectedWords([]);
    setCompletedGroups([]);
    setAttempts(0);
    setGameComplete(false);
    setCurrentWordSet([]);
    setStaticWordGrid([]);
  };

  const isWordCompleted = (word: string) => {
    return completedGroups.some(group => group.includes(word));
  };

  const progressPercentage = currentGroups.length > 0 ? (completedGroups.length / currentGroups.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Word Connections
          </h1>
          <p className="text-gray-600 text-lg">
            Find groups of 4 related words. Words stay in place - no moving around!
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
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <Settings className="w-8 h-8 mx-auto mb-3 text-current" />
                    <h4 className="text-xl font-bold capitalize mb-2">{level}</h4>
                    <p className="text-sm opacity-75">
                      {level === 'easy' && '3 groups, simple words'}
                      {level === 'medium' && '4 groups, common words'}
                      {level === 'hard' && '5 groups, complex words'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-6 py-4 rounded-xl mb-6 text-center shadow-lg">
            <h3 className="text-xl font-bold">Great job! You found a connection! 🎉</h3>
          </div>
        )}

        {/* Game Complete */}
        {gameComplete && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-2xl p-8 mb-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Congratulations! 🎉</h2>
            <p className="text-green-700 mb-6 text-lg">
              You completed all word connections! Final Score: <span className="font-bold">{score}</span>
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
        {gameStarted && !gameComplete && currentGroups.length > 0 && (
          <>
            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Progress</h3>
                <span className="text-sm text-gray-600">{completedGroups.length}/{currentGroups.length} groups</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* STATIC Words Grid - NEVER MOVES */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {staticWordGrid.map((word, index) => (
                <button
                  key={`static-${word}-${index}`}
                  onClick={() => handleWordClick(word)}
                  disabled={isWordCompleted(word)}
                  className={`p-4 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    isWordCompleted(word)
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white cursor-not-allowed shadow-lg'
                      : selectedWords.includes(word)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-800 hover:bg-blue-50 hover:shadow-md border-2 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>

            {/* Selected Words */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Selected Words ({selectedWords.length}/4)
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedWords.map((word, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
                  >
                    {word}
                  </span>
                ))}
                {Array.from({ length: 4 - selectedWords.length }).map((_, index) => (
                  <span
                    key={`empty-${index}`}
                    className="border-2 border-dashed border-gray-300 px-4 py-2 rounded-full text-sm text-gray-400"
                  >
                    Select word
                  </span>
                ))}
              </div>
              <button
                onClick={checkConnection}
                disabled={selectedWords.length !== 4}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-lg transition-all disabled:cursor-not-allowed font-semibold"
              >
                Check Connection
              </button>
            </div>

            {/* Game Stats */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{completedGroups.length}</p>
                  <p className="text-sm text-gray-600">Groups Found</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{attempts}</p>
                  <p className="text-sm text-gray-600">Attempts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{score}</p>
                  <p className="text-sm text-gray-600">Score</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Time's Up */}
        {timeLeft === 0 && gameStarted && !gameComplete && (
          <div className="bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300 rounded-2xl p-8 mt-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-red-800 mb-4">Time's Up!</h2>
            <p className="text-red-700 mb-6 text-lg">
              You found {completedGroups.length} groups. Final Score: <span className="font-bold">{score}</span>
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