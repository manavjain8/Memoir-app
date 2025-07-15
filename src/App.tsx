import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import { Dashboard } from './components/Home/Dashboard';
import { ActivitiesView } from './components/Activities/ActivitiesView';
import { SettingsView } from './components/Settings/SettingsView';
import { ProfileView } from './components/Profile/ProfileView';
import { JournalView } from './components/Journal/JournalView';
import { FlashcardsView } from './components/Flashcards/FlashcardsView';
import { CalendarView } from './components/Calendar/CalendarView';
import { WordConnectionGame } from './components/Games/WordConnectionGame';
import { MemoryMatchGame } from './components/Games/MemoryMatchGame';
import { PatternSequenceGame } from './components/Games/PatternSequenceGame';
import { NumberSequenceGame } from './components/Games/NumberSequenceGame';
import { WordSearchGame } from './components/Games/WordSearchGame';
import { AttentionFocusGame } from './components/Games/AttentionFocusGame';
import { NotificationSystem } from './components/Notifications/NotificationSystem';
import { CaregiverDashboard } from './components/Caregiver/CaregiverDashboard';

function AppContent() {
  const { state, dispatch } = useApp();
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  // Check for existing user data on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('memoir-user');
    const savedOnboarded = localStorage.getItem('memoir-onboarded');
    
    if (savedUser && savedOnboarded === 'true') {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
      dispatch({ type: 'SET_ONBOARDED', payload: true });
    }
  }, [dispatch]);

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('memoir-user', JSON.stringify(state.currentUser));
    }
    localStorage.setItem('memoir-onboarded', state.isOnboarded.toString());
  }, [state.currentUser, state.isOnboarded]);

  const handleNavigate = (view: string) => {
    if (view === 'settings') {
      setIsSettingsOpen(true);
    } else {
      setIsSettingsOpen(false);
      setCurrentGame(null);
      dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
    }
  };

  const handleStartActivity = (activityId: string) => {
    setCurrentGame(activityId);
    
    // Show achievement notification
    setTimeout(() => {
      if ((window as any).showAchievementNotification) {
        (window as any).showAchievementNotification(
          'Activity Started!',
          'Great choice! This activity will help strengthen your cognitive abilities.'
        );
      }
    }, 1000);
  };

  const handleBackFromGame = () => {
    setCurrentGame(null);
    dispatch({ type: 'SET_CURRENT_VIEW', payload: 'activities' });
  };

  // Show onboarding if user hasn't completed it
  if (!state.isOnboarded) {
    return (
      <>
        <OnboardingFlow />
        <NotificationSystem />
      </>
    );
  }

  // Show game if one is selected
  if (currentGame) {
    switch (currentGame) {
      case 'word-connections':
        return <WordConnectionGame onBack={handleBackFromGame} />;
      case 'memory-match':
        return <MemoryMatchGame onBack={handleBackFromGame} />;
      case 'pattern-sequence':
        return <PatternSequenceGame onBack={handleBackFromGame} />;
      case 'number-sequence':
        return <NumberSequenceGame onBack={handleBackFromGame} />;
      case 'word-search':
        return <WordSearchGame onBack={handleBackFromGame} />;
      case 'attention-focus':
        return <AttentionFocusGame onBack={handleBackFromGame} />;
      default:
        return <WordConnectionGame onBack={handleBackFromGame} />;
    }
  }

  // Show settings overlay
  if (isSettingsOpen) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          onMenuClick={() => setIsNavigationOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(false)}
        />
        <SettingsView />
        <NotificationSystem />
      </div>
    );
  }

  // Main app interface
  return (
    <div className="min-h-screen bg-white flex">
      {/* Navigation Sidebar */}
      <Navigation
        isOpen={isNavigationOpen}
        onClose={() => setIsNavigationOpen(false)}
        onNavigate={handleNavigate}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header
          onMenuClick={() => setIsNavigationOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
        
        <main className="flex-1">
          {state.currentView === 'home' && (
            <Dashboard onNavigate={handleNavigate} />
          )}
          {state.currentView === 'activities' && (
            <ActivitiesView onStartActivity={handleStartActivity} />
          )}
          {state.currentView === 'flashcards' && (
            <FlashcardsView />
          )}
          {state.currentView === 'journal' && (
            <JournalView />
          )}
          {state.currentView === 'calendar' && (
            <CalendarView />
          )}
          {state.currentView === 'caregiver-dashboard' && state.currentUser?.type === 'caregiver' && (
            <CaregiverDashboard />
          )}
          {state.currentView === 'profile' && (
            <ProfileView />
          )}
        </main>
      </div>
      
      <NotificationSystem />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;