import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Clock, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GameSession } from '../../types';

interface WordSearchGameProps {
  onBack: () => void;
}

export function WordSearchGame({ onBack }: WordSearchGameProps) {
  const { state, dispatch } = useApp();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordsToFind, setWordsToFind] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{row: number, col: number}[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  // Multiple word lists for variety
  const wordLists = {
    easy: [
      ['CAT', 'DOG', 'SUN', 'CAR'],
      ['BOOK', 'TREE', 'FISH', 'BIRD'],
      ['MOON', 'STAR', 'RAIN', 'WIND'],
      ['HAND', 'FOOT', 'HEAD', 'NOSE']
    ],
    medium: [
      ['HAPPY', 'WATER', 'MUSIC', 'FRIEND'],
      ['GARDEN', 'BRIDGE', 'CASTLE', 'FLOWER'],
      ['SUMMER', 'WINTER', 'SPRING', 'AUTUMN'],
      ['FAMILY', 'SCHOOL', 'HOUSE', 'STREET']
    ],
    hard: [
      ['ELEPHANT', 'MOUNTAIN', 'BUTTERFLY', 'ADVENTURE'],
      ['KNOWLEDGE', 'BEAUTIFUL', 'WONDERFUL', 'DISCOVERY'],
      ['COMPUTER', 'INTERNET', 'KEYBOARD', 'MONITOR'],
      ['HOSPITAL', 'MEDICINE', 'DOCTOR', 'PATIENT']
    ]
  };

  const gridSizes = {
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
    if (foundWords.length === wordsToFind.length && wordsToFind.length > 0) {
      setGameComplete(true);
      // Reasonable time bonus: 1 point per 2 remaining seconds
      const timeBonus = Math.floor(timeLeft / 2);
      setScore(score + timeBonus);
      endGame();
    }
  }, [foundWords, wordsToFind, timeLeft, score]);

  const generateGrid = () => {
    const size = gridSizes[difficulty];
    // Select random word set for variety
    const availableWordSets = wordLists[difficulty];
    const randomWordSet = availableWordSets[Math.floor(Math.random() * availableWordSets.length)];
    setWordsToFind(randomWordSet);
    setFoundWords([]);
    
    // Create empty grid
    const newGrid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
    
    // Place words in grid
    randomWordSet.forEach(word => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        
        if (canPlaceWord(newGrid, word, row, col, direction, size)) {
          placeWord(newGrid, word, row, col, direction);
          placed = true;
        }
        attempts++;
      }
    });
    
    // Fill empty cells with random letters
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
    
    setGrid(newGrid);
  };

  const canPlaceWord = (grid: string[][], word: string, row: number, col: number, direction: number, size: number): boolean => {
    const directions = [
      [0, 1],  // horizontal
      [1, 0],  // vertical
      [1, 1]   // diagonal
    ];
    
    const [dRow, dCol] = directions[direction];
    
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;
      
      if (newRow >= size || newCol >= size || newRow < 0 || newCol < 0) {
        return false;
      }
      
      if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
        return false;
      }
    }
    
    return true;
  };

  const placeWord = (grid: string[][], word: string, row: number, col: number, direction: number) => {
    const directions = [
      [0, 1],  // horizontal
      [1, 0],  // vertical
      [1, 1]   // diagonal
    ];
    
    const [dRow, dCol] = directions[direction];
    
    for (let i = 0; i < word.length; i++) {
      const newRow = row + i * dRow;
      const newCol = col + i * dCol;
      grid[newRow][newCol] = word[i];
    }
  };

  const handleCellClick = (row: number, col: number) => {
    const cellIndex = selectedCells.findIndex(cell => cell.row === row && cell.col === col);
    
    if (cellIndex >= 0) {
      // Cell already selected, remove it
      setSelectedCells(selectedCells.filter((_, index) => index !== cellIndex));
    } else {
      // Add cell to selection
      setSelectedCells([...selectedCells, { row, col }]);
    }
  };

  const checkSelectedWord = () => {
    if (selectedCells.length < 2) return;
    
    // Sort cells to form a line
    const sortedCells = [...selectedCells].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });
    
    // Extract word from selected cells
    const word = sortedCells.map(cell => grid[cell.row][cell.col]).join('');
    const reverseWord = word.split('').reverse().join('');
    
    // Check if word is in the list
    const foundWord = wordsToFind.find(w => w === word || w === reverseWord);
    
    if (foundWord && !foundWords.includes(foundWord)) {
      setFoundWords([...foundWords, foundWord]);
      // Reasonable scoring: 3-8 points per word
      const points = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
      setScore(score + points);
    }
    
    setSelectedCells([]);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setGameComplete(false);
    setFoundWords([]);
    setSelectedCells([]);
    setTimeLeft(difficulty === 'easy' ? 420 : difficulty === 'medium' ? 300 : 240);
    generateGrid();
  };

  const endGame = () => {
    if (state.currentUser && score > 0) {
      const session: GameSession = {
        id: Date.now().toString(),
        gameType: 'word-search',
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
    setGameComplete(false);
    setGrid([]);
    setWordsToFind([]);
    setFoundWords([]);
    setSelectedCells([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-6">
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Word Search
          </h1>
          <p className="text-gray-600 text-lg">
            Find the hidden words in the letter grid
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
                      ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg'
                      : 'border-gray-200 hover:border-orange-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <Settings className="w-8 h-8 mx-auto mb-3 text-current" />
                    <h4 className="text-xl font-bold capitalize mb-2">{level}</h4>
                    <p className="text-sm opacity-75">
                      {level === 'easy' && '8x8 grid, 4 words'}
                      {level === 'medium' && '12x12 grid, 4 words'}
                      {level === 'hard' && '16x16 grid, 4 words'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Complete */}
        {gameComplete && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-2xl p-8 mb-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Excellent! All words found! 🎉</h2>
            <p className="text-green-700 mb-6 text-lg">
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
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Word List */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Find These Words</h3>
              <div className="space-y-2">
                {wordsToFind.map((word, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      foundWords.includes(word)
                        ? 'border-green-300 bg-green-50 text-green-700 line-through'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{word}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(foundWords.length / wordsToFind.length) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {foundWords.length}/{wordsToFind.length} words found
                </p>
              </div>
            </div>

            {/* Grid */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Letter Grid</h3>
                <button
                  onClick={checkSelectedWord}
                  disabled={selectedCells.length < 2}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-4 py-2 rounded-lg transition-all disabled:cursor-not-allowed font-semibold"
                >
                  Check Word
                </button>
              </div>
              
              <div 
                className="grid gap-1 mx-auto"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSizes[difficulty]}, minmax(0, 1fr))`,
                  maxWidth: `${gridSizes[difficulty] * 2.5}rem`
                }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((letter, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`w-8 h-8 border border-gray-300 rounded text-sm font-bold transition-all hover:scale-110 ${
                        isCellSelected(rowIndex, colIndex)
                          ? 'bg-orange-200 text-orange-800 border-orange-400'
                          : 'bg-white text-gray-800 hover:bg-orange-50'
                      }`}
                    >
                      {letter}
                    </button>
                  ))
                )}
              </div>
              
              <p className="text-sm text-gray-600 mt-4 text-center">
                Click letters to select them, then click "Check Word"
              </p>
            </div>
          </div>
        )}

        {/* Time's Up */}
        {timeLeft === 0 && gameStarted && !gameComplete && (
          <div className="bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300 rounded-2xl p-8 mt-6 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-red-800 mb-4">Time's Up!</h2>
            <p className="text-red-700 mb-6 text-lg">
              You found {foundWords.length}/{wordsToFind.length} words. Final Score: <span className="font-bold">{score}</span>
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