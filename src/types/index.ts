export interface User {
  id: string;
  name: string;
  type: 'user' | 'caregiver';
  profileCompleted: boolean;
  settings: UserSettings;
  caregiverFor?: string[];
  connectedAccounts?: string[];
  stats: UserStats;
}

export interface UserStats {
  activitiesCompleted: number;
  currentStreak: number;
  totalScore: number;
  lastActivityDate?: Date;
  streakStartDate?: Date;
}

export interface UserSettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  voiceEnabled: boolean;
  reminderFrequency: 'low' | 'medium' | 'high';
  preferredActivities: string[];
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'puzzle' | 'word-game' | 'sequencing' | 'memory';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number; // in minutes
  completed: boolean;
  completedAt?: Date;
  score?: number;
  userId: string;
}

export interface GameSession {
  id: string;
  gameType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  completedAt: Date;
  userId: string;
  duration: number;
}

export interface Flashcard {
  id: string;
  title: string;
  frontText: string;
  backText: string;
  imageUrl?: string;
  category: 'family' | 'friends' | 'places' | 'memories' | 'other';
  createdBy: string;
  tags: string[];
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  imageUrls: string[];
  audioUrl?: string;
  createdAt: Date;
  createdBy: string;
  tags: string[];
  isPublic: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  description: string;
  type: 'appointment' | 'medication' | 'activity' | 'social';
  location?: string;
  reminder: boolean;
  date: Date;
  createdBy: string;
}

export interface EngagementData {
  userId: string;
  date: Date;
  activitiesCompleted: number;
  totalTimeSpent: number; // in minutes
  averageScore: number;
  moodRating: number; // 1-5 scale
  notes: string[];
}