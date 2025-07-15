import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, Activity, Flashcard, JournalEntry, EngagementData, GameSession, CalendarEvent } from '../types';

interface AppState {
  currentUser: User | null;
  isOnboarded: boolean;
  activities: Activity[];
  flashcards: Flashcard[];
  journalEntries: JournalEntry[];
  calendarEvents: CalendarEvent[];
  gameSessions: GameSession[];
  engagementData: EngagementData[];
  currentView: string;
  connectedUsers: User[];
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  earnedAt?: Date;
  userId: string;
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ONBOARDED'; payload: boolean }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY'; payload: Activity }
  | { type: 'ADD_GAME_SESSION'; payload: GameSession }
  | { type: 'ADD_FLASHCARD'; payload: Flashcard }
  | { type: 'DELETE_FLASHCARD'; payload: string }
  | { type: 'ADD_JOURNAL_ENTRY'; payload: JournalEntry }
  | { type: 'DELETE_JOURNAL_ENTRY'; payload: string }
  | { type: 'ADD_CALENDAR_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_CALENDAR_EVENT'; payload: string }
  | { type: 'SET_CURRENT_VIEW'; payload: string }
  | { type: 'UPDATE_USER_SETTINGS'; payload: Partial<User['settings']> }
  | { type: 'UPDATE_USER_STATS'; payload: Partial<User['stats']> }
  | { type: 'CONNECT_USER'; payload: User }
  | { type: 'EARN_ACHIEVEMENT'; payload: Achievement }
  | { type: 'LOGOUT' };

const initialState: AppState = {
  currentUser: null,
  isOnboarded: false,
  activities: [],
  flashcards: [],
  journalEntries: [],
  calendarEvents: [],
  gameSessions: [],
  engagementData: [],
  currentView: 'home',
  connectedUsers: [],
  achievements: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function calculateStreak(sessions: GameSession[], userId: string): number {
  const userSessions = sessions
    .filter(s => s.userId === userId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  if (userSessions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group sessions by date
  const sessionsByDate = new Map<string, GameSession[]>();
  userSessions.forEach(session => {
    const sessionDate = new Date(session.completedAt);
    sessionDate.setHours(0, 0, 0, 0);
    const dateKey = sessionDate.toDateString();
    
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, []);
    }
    sessionsByDate.get(dateKey)!.push(session);
  });

  // Check consecutive days
  let currentDate = new Date(today);
  while (true) {
    const dateKey = currentDate.toDateString();
    if (sessionsByDate.has(dateKey)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_ONBOARDED':
      return { ...state, isOnboarded: action.payload };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.payload] };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(activity =>
          activity.id === action.payload.id ? action.payload : activity
        ),
      };
    case 'ADD_GAME_SESSION': {
      const newSessions = [...state.gameSessions, action.payload];
      const userSessions = newSessions.filter(s => s.userId === action.payload.userId);
      const totalScore = userSessions.reduce((sum, s) => sum + s.score, 0);
      const activitiesCompleted = userSessions.length;
      const currentStreak = calculateStreak(newSessions, action.payload.userId);

      return {
        ...state,
        gameSessions: newSessions,
        currentUser: state.currentUser ? {
          ...state.currentUser,
          stats: {
            ...state.currentUser.stats,
            activitiesCompleted,
            totalScore,
            currentStreak,
            lastActivityDate: new Date(),
          }
        } : null,
      };
    }
    case 'ADD_FLASHCARD':
      return { ...state, flashcards: [...state.flashcards, action.payload] };
    case 'DELETE_FLASHCARD':
      return {
        ...state,
        flashcards: state.flashcards.filter(card => card.id !== action.payload),
      };
    case 'ADD_JOURNAL_ENTRY':
      return { ...state, journalEntries: [...state.journalEntries, action.payload] };
    case 'DELETE_JOURNAL_ENTRY':
      return {
        ...state,
        journalEntries: state.journalEntries.filter(entry => entry.id !== action.payload),
      };
    case 'ADD_CALENDAR_EVENT':
      return { ...state, calendarEvents: [...state.calendarEvents, action.payload] };
    case 'DELETE_CALENDAR_EVENT':
      return {
        ...state,
        calendarEvents: state.calendarEvents.filter(event => event.id !== action.payload),
      };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'UPDATE_USER_SETTINGS':
      return {
        ...state,
        currentUser: state.currentUser
          ? { ...state.currentUser, settings: { ...state.currentUser.settings, ...action.payload } }
          : null,
      };
    case 'UPDATE_USER_STATS':
      return {
        ...state,
        currentUser: state.currentUser
          ? { ...state.currentUser, stats: { ...state.currentUser.stats, ...action.payload } }
          : null,
      };
    case 'CONNECT_USER':
      return {
        ...state,
        connectedUsers: [...state.connectedUsers, action.payload],
      };
    case 'EARN_ACHIEVEMENT':
      return {
        ...state,
        achievements: [...state.achievements, action.payload],
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isOnboarded: false,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('memoir-user');
    const savedOnboarded = localStorage.getItem('memoir-onboarded');
    const savedFlashcards = localStorage.getItem('memoir-flashcards');
    const savedJournalEntries = localStorage.getItem('memoir-journal-entries');
    const savedCalendarEvents = localStorage.getItem('memoir-calendar-events');
    const savedGameSessions = localStorage.getItem('memoir-game-sessions');
    const savedConnectedUsers = localStorage.getItem('memoir-connected-users');
    const savedAchievements = localStorage.getItem('memoir-achievements');

    if (savedUser && savedUser !== "undefined" && savedOnboarded === 'true') {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
      dispatch({ type: 'SET_ONBOARDED', payload: true });
    }

    if (savedFlashcards && savedFlashcards !== "undefined") {
      const flashcards = JSON.parse(savedFlashcards);
      flashcards.forEach((card: Flashcard) => {
        dispatch({ type: 'ADD_FLASHCARD', payload: card });
      });
    }

    if (savedJournalEntries && savedJournalEntries !== "undefined") {
      const entries = JSON.parse(savedJournalEntries);
      entries.forEach((entry: JournalEntry) => {
        dispatch({ type: 'ADD_JOURNAL_ENTRY', payload: {
          ...entry,
          createdAt: new Date(entry.createdAt)
        } });
      });
    }

    if (savedCalendarEvents && savedCalendarEvents !== "undefined") {
      const events = JSON.parse(savedCalendarEvents);
      events.forEach((event: CalendarEvent) => {
        dispatch({ type: 'ADD_CALENDAR_EVENT', payload: {
          ...event,
          date: new Date(event.date)
        } });
      });
    }

    if (savedGameSessions && savedGameSessions !== "undefined") {
      const sessions = JSON.parse(savedGameSessions);
      sessions.forEach((session: GameSession) => {
        dispatch({ type: 'ADD_GAME_SESSION', payload: {
          ...session,
          completedAt: new Date(session.completedAt)
        } });
      });
    }

    if (savedConnectedUsers && savedConnectedUsers !== "undefined") {
      const users = JSON.parse(savedConnectedUsers);
      users.forEach((user: User) => {
        dispatch({ type: 'CONNECT_USER', payload: user });
      });
    }

    if (savedAchievements && savedAchievements !== "undefined") {
      const achievements = JSON.parse(savedAchievements);
      achievements.forEach((achievement: Achievement) => {
        dispatch({ type: 'EARN_ACHIEVEMENT', payload: {
          ...achievement,
          earnedAt: achievement.earnedAt ? new Date(achievement.earnedAt) : undefined
        } });
      });
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('memoir-user', JSON.stringify(state.currentUser));
    }
    localStorage.setItem('memoir-onboarded', state.isOnboarded.toString());
    localStorage.setItem('memoir-flashcards', JSON.stringify(state.flashcards));
    localStorage.setItem('memoir-journal-entries', JSON.stringify(state.journalEntries));
    localStorage.setItem('memoir-calendar-events', JSON.stringify(state.calendarEvents));
    localStorage.setItem('memoir-game-sessions', JSON.stringify(state.gameSessions));
    localStorage.setItem('memoir-connected-users', JSON.stringify(state.connectedUsers));
    localStorage.setItem('memoir-achievements', JSON.stringify(state.achievements));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}