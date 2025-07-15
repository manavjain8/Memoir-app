import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SettingsSetupProps {
  userType: 'user' | 'caregiver';
  onComplete: () => void;
}

export function SettingsSetup({ userType, onComplete }: SettingsSetupProps) {
  const { state, dispatch } = useApp();
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!state.currentUser) return;
    
    setIsLoading(true);
    
    // Update user settings
    dispatch({
      type: 'UPDATE_USER_SETTINGS',
      payload: {
        fontSize,
        highContrast,
        voiceEnabled,
        reminderFrequency,
      },
    });
    
    // Mark onboarding as complete
    dispatch({ type: 'SET_ONBOARDED', payload: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    onComplete();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Personalize your experience
          </h2>
          <p className="text-gray-600">
            These settings help make Memoir comfortable and accessible for you.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Text Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'extra-large', label: 'Extra Large' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFontSize(value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    fontSize === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className={`${
                    value === 'small' ? 'text-sm' :
                    value === 'medium' ? 'text-base' :
                    value === 'large' ? 'text-lg' : 'text-xl'
                  }`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* High Contrast */}
          <div>
            <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <div>
                <span className="font-medium text-gray-800">High Contrast Mode</span>
                <p className="text-sm text-gray-600">Easier to see text and buttons</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded border-2 transition-all ${
                  highContrast 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {highContrast && <Check className="w-4 h-4 text-white m-0.5" />}
                </div>
              </div>
            </label>
          </div>
          
          {/* Voice Commands */}
          <div>
            <label className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <div>
                <span className="font-medium text-gray-800">Voice Commands</span>
                <p className="text-sm text-gray-600">Navigate using your voice</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded border-2 transition-all ${
                  voiceEnabled 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {voiceEnabled && <Check className="w-4 h-4 text-white m-0.5" />}
                </div>
              </div>
            </label>
          </div>
          
          {/* Reminder Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Activity Reminders
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: 'Few' },
                { value: 'medium', label: 'Some' },
                { value: 'high', label: 'Many' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setReminderFrequency(value as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    reminderFrequency === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <span>Setting up your profile...</span>
          ) : (
            <>
              <span>Complete Setup</span>
              <Check className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}