import React from 'react';
import { User, Heart } from 'lucide-react';

interface UserTypeSelectionProps {
  onSelect: (type: 'user' | 'caregiver') => void;
}

export function UserTypeSelection({ onSelect }: UserTypeSelectionProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            How will you be using Memoir?
          </h2>
          <p className="text-gray-600">
            This helps us personalize your experience
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => onSelect('user')}
            className="w-full bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 rounded-xl p-6 transition-all text-left group"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  I'm using this for myself
                </h3>
                <p className="text-gray-600">
                  Access activities, create memories, and engage with cognitive exercises designed for you.
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => onSelect('caregiver')}
            className="w-full bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 rounded-xl p-6 transition-all text-left group"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  I'm a caregiver or family member
                </h3>
                <p className="text-gray-600">
                  Help manage activities, track progress, and create meaningful content for your loved one.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}