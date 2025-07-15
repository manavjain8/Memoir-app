import React, { useState } from 'react';
import { Plus, Image, Heart, Edit3, Trash2, Search, Play, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Flashcard } from '../../types';

export function FlashcardsView() {
  const { state, dispatch } = useApp();
  const { flashcards, currentUser } = state;
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isStudying, setIsStudying] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [studyResults, setStudyResults] = useState<{[key: string]: 'correct' | 'incorrect'}>({});

  const [newCard, setNewCard] = useState({
    title: '',
    frontText: '',
    backText: '',
    category: 'family' as const,
    tags: '',
  });

  const categories = [
    { id: 'all', label: 'All Cards' },
    { id: 'family', label: 'Family' },
    { id: 'friends', label: 'Friends' },
    { id: 'places', label: 'Places' },
    { id: 'memories', label: 'Memories' },
    { id: 'other', label: 'Other' },
  ];

  const filteredCards = flashcards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.frontText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.backText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateCard = () => {
    if (!newCard.title.trim() || !newCard.frontText.trim() || !newCard.backText.trim() || !currentUser) return;

    const card: Flashcard = {
      id: Date.now().toString(),
      title: newCard.title.trim(),
      frontText: newCard.frontText.trim(),
      backText: newCard.backText.trim(),
      category: newCard.category,
      createdBy: currentUser.id,
      tags: newCard.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date(),
    };

    dispatch({ type: 'ADD_FLASHCARD', payload: card });
    setNewCard({ title: '', frontText: '', backText: '', category: 'family', tags: '' });
    setIsCreating(false);
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this memory card?')) {
      dispatch({ type: 'DELETE_FLASHCARD', payload: cardId });
    }
  };

  const startStudySession = () => {
    if (filteredCards.length === 0) return;
    setIsStudying(true);
    setCurrentCardIndex(0);
    setShowBack(false);
    setStudyResults({});
  };

  const markAnswer = (correct: boolean) => {
    const currentCard = filteredCards[currentCardIndex];
    setStudyResults(prev => ({
      ...prev,
      [currentCard.id]: correct ? 'correct' : 'incorrect'
    }));
    
    // Move to next card after marking
    setTimeout(() => {
      nextCard();
    }, 1000);
  };

  const nextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowBack(false);
    } else {
      // End study session
      setIsStudying(false);
      setCurrentCardIndex(0);
      setShowBack(false);
      
      // Show results
      const correct = Object.values(studyResults).filter(r => r === 'correct').length;
      const total = Object.keys(studyResults).length;
      alert(`Study session complete!\nCorrect: ${correct}/${total} (${Math.round((correct/total)*100)}%)`);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowBack(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Memory Cards</h1>
              <p className="text-gray-600">
                Create and review personalized flashcards for important memories
              </p>
            </div>
            <div className="flex space-x-3">
              {filteredCards.length > 0 && (
                <button
                  onClick={startStudySession}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl transition-all flex items-center space-x-2 shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  <span>Study Cards</span>
                </button>
              )}
              <button
                onClick={() => setIsCreating(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>New Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Study Session Modal */}
        {isStudying && filteredCards.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Study Session</h2>
                <p className="text-gray-600">
                  Card {currentCardIndex + 1} of {filteredCards.length}
                </p>
              </div>

              <div className="mb-8">
                <div 
                  className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 min-h-[200px] flex items-center justify-center cursor-pointer border-2 border-blue-200 hover:border-blue-300 transition-colors"
                  onClick={() => setShowBack(!showBack)}
                >
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      {filteredCards[currentCardIndex].title}
                    </h3>
                    <p className="text-lg text-gray-700">
                      {showBack 
                        ? filteredCards[currentCardIndex].backText 
                        : filteredCards[currentCardIndex].frontText
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-4">
                      {showBack ? 'Click to see front' : 'Click to reveal answer'}
                    </p>
                  </div>
                </div>
              </div>

              {showBack && (
                <div className="flex justify-center space-x-4 mb-6">
                  <button
                    onClick={() => markAnswer(false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Incorrect</span>
                  </button>
                  <button
                    onClick={() => markAnswer(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Correct</span>
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={previousCard}
                  disabled={currentCardIndex === 0}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:text-gray-400 transition-colors"
                >
                  Previous
                </button>
                
                <button
                  onClick={() => setIsStudying(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  End Session
                </button>
                
                <button
                  onClick={nextCard}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  {currentCardIndex === filteredCards.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Card Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Memory Card</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Title
                  </label>
                  <input
                    type="text"
                    value={newCard.title}
                    onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mom's Birthday, Family Vacation..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Front of Card (Question/Prompt)
                  </label>
                  <textarea
                    value={newCard.frontText}
                    onChange={(e) => setNewCard({ ...newCard, frontText: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="What do you want to remember? e.g., 'Who is this person?', 'Where did we go?'"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Back of Card (Answer/Details)
                  </label>
                  <textarea
                    value={newCard.backText}
                    onChange={(e) => setNewCard({ ...newCard, backText: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="The answer or details you want to remember..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newCard.category}
                      onChange={(e) => setNewCard({ ...newCard, category: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="family">Family</option>
                      <option value="friends">Friends</option>
                      <option value="places">Places</option>
                      <option value="memories">Memories</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={newCard.tags}
                      onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="important, birthday, vacation..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCard}
                  disabled={!newCard.title.trim() || !newCard.frontText.trim() || !newCard.backText.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Create Card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your memory cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 text-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flashcards Grid */}
        {filteredCards.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-3">
                    {card.title}
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Front:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {card.frontText}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Back:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {card.backText}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                      {card.category}
                    </span>
                    {card.tags.length > 0 && (
                      <div className="flex space-x-1">
                        {card.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'No cards found' : 'Create your first memory card'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Start building your collection of important memories and information'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create First Card
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}