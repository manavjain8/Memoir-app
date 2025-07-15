import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <Heart className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4 memoir-title">
            Welcome to Memoir
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            A gentle companion for meaningful cognitive engagement and cherished memories.
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
            <p className="text-sm text-gray-700">
              🧠 <strong>Engage your mind</strong> with gentle brain activities
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
            <p className="text-sm text-gray-700">
              💝 <strong>Preserve memories</strong> with personalized flashcards
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
            <p className="text-sm text-gray-700">
              📖 <strong>Share stories</strong> in your memory journal
            </p>
          </div>
        </div>
        
        <button
          onClick={onNext}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}