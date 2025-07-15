import React from 'react';
import { Menu, Settings, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onMenuClick: () => void;
  onSettingsClick: () => void;
}

export function Header({ onMenuClick, onSettingsClick }: HeaderProps) {
  const { state, dispatch } = useApp();
  const { currentUser } = state;

  const handleLogoClick = () => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'home' });
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-blue-600" />
          </button>
          
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Heart className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-800 memoir-title">
              Memoir
            </h1>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {currentUser && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                Hello, {currentUser.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {currentUser.type}
              </p>
            </div>
          )}
          
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
            aria-label="Open settings"
          >
            <Settings className="w-6 h-6 text-blue-600" />
          </button>
        </div>
      </div>
    </header>
  );
}