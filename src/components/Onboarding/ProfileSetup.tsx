import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface ProfileSetupProps {
  userType: 'user' | 'caregiver';
  onNext: () => void;
}

export function ProfileSetup({ userType, onNext }: ProfileSetupProps) {
  const { dispatch } = useApp();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      type: userType,
      profileCompleted: false,
      settings: {
        fontSize: 'medium',
        highContrast: false,
        voiceEnabled: false,
        reminderFrequency: 'medium',
        preferredActivities: [],
      },
      stats: {
        activitiesCompleted: 0,
        currentStreak: 0,
        totalScore: 0,
      },
      connectedAccounts: [],
    };
    
    dispatch({ type: 'SET_USER', payload: newUser });
    setIsLoading(false);
    onNext();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Let's get to know you
          </h2>
          <p className="text-gray-600">
            What would you like us to call you?
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span>Setting up...</span>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}