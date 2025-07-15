import React from 'react';
import { 
  Home, 
  Brain, 
  BookOpen, 
  Image, 
  BarChart3, 
  User,
  X 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function Navigation({ isOpen, onClose, onNavigate }: NavigationProps) {
  const { state } = useApp();
  const { currentUser, currentView } = state;

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'activities', label: 'Brain Activities', icon: Brain },
    { id: 'flashcards', label: 'Memory Cards', icon: Image },
    { id: 'journal', label: 'Memory Journal', icon: BookOpen },
    ...(currentUser?.type === 'caregiver' 
      ? [{ id: 'caregiver-dashboard', label: 'Caregiver Dashboard', icon: BarChart3 }]
      : []
    ),
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavigate = (viewId: string) => {
    onNavigate(viewId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Navigation Panel */}
      <nav className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl lg:relative lg:w-64 lg:shadow-none">
        <div className="p-4 border-b border-gray-100 lg:hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <ul className="space-y-2">
            {navigationItems.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <button
                  onClick={() => handleNavigate(id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    currentView === id
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </div>
  );
}