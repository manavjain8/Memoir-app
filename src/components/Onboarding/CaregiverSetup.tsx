import React, { useState } from 'react';
import { Heart, Plus, ArrowRight, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';

interface CaregiverSetupProps {
  onNext: () => void;
}

export function CaregiverSetup({ onNext }: CaregiverSetupProps) {
  const { dispatch } = useApp();
  const [caregiverName, setCaregiverName] = useState('');
  const [connectionCodes, setConnectionCodes] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const addConnectionCodeField = () => {
    setConnectionCodes([...connectionCodes, '']);
  };

  const updateConnectionCode = (index: number, value: string) => {
    const newCodes = [...connectionCodes];
    newCodes[index] = value.toUpperCase();
    setConnectionCodes(newCodes);
    
    // Clear errors when user starts typing
    if (errors[index]) {
      const newErrors = [...errors];
      newErrors[index] = '';
      setErrors(newErrors);
    }
  };

  const removeConnectionCode = (index: number) => {
    if (connectionCodes.length > 1) {
      setConnectionCodes(connectionCodes.filter((_, i) => i !== index));
      setErrors(errors.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caregiverName.trim()) return;

    setIsLoading(true);
    setErrors([]);

    try {
      // Create caregiver user
      const caregiverUser: User = {
        id: Date.now().toString(),
        name: caregiverName.trim(),
        type: 'caregiver',
        profileCompleted: true,
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

      dispatch({ type: 'SET_USER', payload: caregiverUser });

      // Connect to users based on connection codes
      const validCodes = connectionCodes.filter(code => code.trim().length > 0);
      const newErrors: string[] = [];

      for (let i = 0; i < validCodes.length; i++) {
        const code = validCodes[i];
        
        // Simulate API call to connect user
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
          // For demo purposes, create mock connected users
          const connectedUser: User = {
            id: code.replace('MEM', ''),
            name: `Connected User ${code.slice(-3)}`,
            type: 'user',
            profileCompleted: true,
            settings: {
              fontSize: 'medium',
              highContrast: false,
              voiceEnabled: false,
              reminderFrequency: 'medium',
              preferredActivities: [],
            },
            stats: {
              activitiesCompleted: Math.floor(Math.random() * 30) + 5,
              currentStreak: Math.floor(Math.random() * 10) + 1,
              totalScore: Math.floor(Math.random() * 3000) + 500,
            },
            connectedAccounts: [],
          };

          dispatch({ type: 'CONNECT_USER', payload: connectedUser });
        } catch (err) {
          newErrors[i] = `Invalid connection code: ${code}`;
        }
      }

      setErrors(newErrors);

      if (newErrors.filter(e => e).length === 0) {
        onNext();
      }
    } catch (err) {
      console.error('Failed to set up caregiver account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Set Up Your Caregiver Account
          </h2>
          <p className="text-gray-600">
            Connect with your loved ones to monitor their progress and provide support
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Caregiver Name */}
          <div>
            <label htmlFor="caregiverName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="caregiverName"
              value={caregiverName}
              onChange={(e) => setCaregiverName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Connection Codes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connection Codes (Optional)
            </label>
            <p className="text-sm text-gray-600 mb-4">
              Enter the connection codes of users you want to monitor. You can add more later in settings.
            </p>
            
            <div className="space-y-3">
              {connectionCodes.map((code, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => updateConnectionCode(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center"
                    placeholder="MEM123456"
                    maxLength={9}
                  />
                  {connectionCodes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeConnectionCode(index)}
                      className="px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              
              {errors.map((error, index) => (
                error && (
                  <p key={index} className="text-red-600 text-sm">
                    {error}
                  </p>
                )
              ))}
            </div>

            <button
              type="button"
              onClick={addConnectionCodeField}
              className="mt-3 flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add another connection code</span>
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">
                  How Connection Codes Work
                </p>
                <p className="text-sm text-purple-600">
                  Each user has a unique connection code (like MEM123456). When you enter their code, 
                  you'll be able to view their progress, memory cards, journal entries, and schedule.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!caregiverName.trim() || isLoading}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <span>Setting up account...</span>
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