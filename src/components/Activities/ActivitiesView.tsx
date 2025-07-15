import React, { useState } from 'react';
import { Brain, Clock, Star, Play, Trophy } from 'lucide-react';

interface ActivitiesViewProps {
  onStartActivity: (activityId: string) => void;
}

export function ActivitiesView({ onStartActivity }: ActivitiesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Activities', count: 6 },
    { id: 'memory', label: 'Memory', count: 2 },
    { id: 'attention', label: 'Attention', count: 2 },
    { id: 'language', label: 'Language', count: 2 }
  ];

  const activities = [
    {
      id: 'word-connections',
      title: 'Word Connections',
      description: 'Connect related words and concepts to strengthen memory pathways',
      category: 'language',
      difficulty: 'Medium',
      duration: 10,
      rating: 4.8,
      completed: false,
      thumbnail: 'https://images.pexels.com/photos/7092613/pexels-photo-7092613.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
    },
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Find matching pairs by flipping cards to exercise visual memory',
      category: 'memory',
      difficulty: 'Easy',
      duration: 15,
      rating: 4.9,
      completed: false,
      thumbnail: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
    },
    {
      id: 'pattern-sequence',
      title: 'Pattern Sequence',
      description: 'Watch and repeat color patterns to improve sequential memory',
      category: 'memory',
      difficulty: 'Hard',
      duration: 12,
      rating: 4.7,
      completed: false,
      thumbnail: 'https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
    },
    {
      id: 'number-sequence',
      title: 'Number Sequence',
      description: 'Complete mathematical sequences and number patterns',
      category: 'attention',
      difficulty: 'Medium',
      duration: 8,
      rating: 4.6,
      completed: false,
      thumbnail: 'https://images.pexels.com/photos/6256074/pexels-photo-6256074.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
    },
    {
      id: 'word-search',
      title: 'Word Search',
      description: 'Find hidden words in letter grids to improve visual scanning',
      category: 'language',
      difficulty: 'Easy',
      duration: 10,
      rating: 4.5,
      completed: false,
      thumbnail: 'https://images.pexels.com/photos/4173624/pexels-photo-4173624.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
    },
    {
      id: 'attention-focus',
      title: 'Focus Training',
      description: 'Track moving objects and respond to visual cues quickly',
      category: 'attention',
      difficulty: 'Hard',
      duration: 7,
      rating: 4.4,
      completed: false,
      thumbnail: 'https://images.pexels.com/photos/6256066/pexels-photo-6256066.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1'
    }
  ];

  const filteredActivities = selectedCategory === 'all' 
    ? activities 
    : activities.filter(activity => activity.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Hard': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Brain Activities
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Gentle exercises designed to engage your mind and strengthen cognitive abilities
        </p>
      </div>

      {/* Category Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-xl border-2 transition-all transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow-lg'
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800'
              }`}
            >
              <span className="font-medium">{category.label}</span>
              <span className="ml-2 text-sm opacity-75">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all transform hover:-translate-y-2"
          >
            {/* Thumbnail */}
            <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
              <img
                src={activity.thumbnail}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
              {activity.completed && (
                <div className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full shadow-lg">
                  <Trophy className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                  {activity.title}
                </h3>
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{activity.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2">
                {activity.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center justify-between mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                  {activity.difficulty}
                </span>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{activity.duration} min</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onStartActivity(activity.id)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-4 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105"
              >
                <Play className="w-5 h-5" />
                <span>{activity.completed ? 'Play Again' : 'Start Activity'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            No activities in this category yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back soon for new activities, or try a different category.
          </p>
        </div>
      )}
    </div>
  );
}