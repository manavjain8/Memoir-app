import React, { useState } from 'react';
import { User, Plus, LogIn, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AccountSelectionProps {
  userType: 'user' | 'caregiver';
  onContinue: () => void;
  onBack: () => void;
}

export function AccountSelection({ userType, onContinue, onBack }: AccountSelectionProps) {
  const { dispatch } = useApp();
  const [selectedOption, setSelectedOption] = useState<'new' | 'existing' | null>(null);
  const [connectionCode, setConnectionCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinueWithNew = () => {
    setSelectedOption('new');
    onContinue();
  };

  const handleContinueWithExisting = async () => {
    if (!connectionCode.trim()) {
      setError('Please enter a connection code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate loading existing account data
      await new Promise(resolve => setTimeout(resolve, 1500));

      // For demo purposes, create a mock existing user
      const existingUser = {
        id: connectionCode.replace('MEM', ''),
        name: `User ${connectionCode}`,
        type: userType,
        profileCompleted: true,
        settings: {
          fontSize: 'medium' as const,
          highContrast: false,
          voiceEnabled: false,
          reminderFrequency: 'medium' as const,
          preferredActivities: [],
        },
        stats: {
          activitiesCompleted: Math.floor(Math.random() * 20) + 5,
          currentStreak: Math.floor(Math.random() * 7) + 1,
          totalScore: Math.floor(Math.random() * 2000) + 500,
        },
        connectedAccounts: [],
      };

      dispatch({ type: 'SET_USER', payload: existingUser });
      dispatch({ type: 'SET_ONBOARDED', payload: true });
    } catch (err) {
      setError('Failed to load account. Please check your connection code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {userType === 'caregiver' ? 'Caregiver Account Setup' : 'Account Setup'}
          </h2>
          <p className="text-gray-600">
            {userType === 'caregiver' 
              ? 'Set up your caregiver account to monitor and support your loved ones'
              : 'Choose how you\'d like to set up your Memoir account'
            }
          </p>
        </div>

        <div className="space-y-4">
          {/* Create New Account */}
          <button
            onClick={handleContinueWithNew}
            className="w-full bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 rounded-xl p-6 transition-all text-left group"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Create New Account
                </h3>
                <p className="text-gray-600">
                  {userType === 'caregiver'
                    ? 'Start fresh with a new caregiver account and connect to existing user accounts'
                    : 'Start fresh with a new account and personalized settings'
                  }
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>

          {/* Continue with Existing Account */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <LogIn className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Continue with Existing Account
                </h3>
                <p className="text-gray-600 mb-4">
                  {userType === 'caregiver'
                    ? 'Enter your existing caregiver connection code to restore your account'
                    : 'Enter your connection code to restore your existing account and data'
                  }
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connection Code
                </label>
                <input
                  type="text"
                  value={connectionCode}
                  onChange={(e) => {
                    setConnectionCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center"
                  placeholder="Enter code (e.g., MEM123456)"
                  maxLength={9}
                />
                {error && (
                  <p className="text-red-600 text-sm mt-2">{error}</p>
                )}
              </div>

              <button
                onClick={handleContinueWithExisting}
                disabled={!connectionCode.trim() || isLoading}
                className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Loading Account...' : 'Continue with Existing Account'}
              </button>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to user type selection
          </button>
        </div>
      </div>
    </div>
  );
}