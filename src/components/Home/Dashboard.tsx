import React from 'react';
import { Brain, Image, BookOpen, Calendar, Trophy, Heart, Star, Zap, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { state } = useApp();
  const { currentUser, gameSessions, flashcards, journalEntries, calendarEvents } = state;

  // Calculate real user stats
  const userSessions = gameSessions.filter(s => s.userId === currentUser?.id);
  const totalScore = userSessions.reduce((sum, s) => sum + s.score, 0);
  const activitiesCompleted = userSessions.length;
  
  // Calculate actual streak based on consecutive days
  const calculateStreak = () => {
    if (userSessions.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Group sessions by date
    const sessionsByDate = new Map<string, boolean>();
    userSessions.forEach(session => {
      const sessionDate = new Date(session.completedAt);
      sessionDate.setHours(0, 0, 0, 0);
      sessionsByDate.set(sessionDate.toDateString(), true);
    });
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check consecutive days backwards from today
    while (sessionsByDate.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();

  // Get user's actual data counts
  const userFlashcards = flashcards.filter(f => f.createdBy === currentUser?.id);
  const userJournalEntries = journalEntries.filter(j => j.createdBy === currentUser?.id);
  const userCalendarEvents = calendarEvents.filter(e => e.createdBy === currentUser?.id);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const activities = [
    {
      id: 'word-puzzle',
      title: 'Word Connections',
      description: 'Find related words and make connections',
      icon: Brain,
      color: 'bg-gradient-to-br from-blue-400 to-blue-600',
      difficulty: 'Medium',
      duration: '10 min',
      progress: Math.min((userSessions.filter(s => s.gameType === 'word-connections').length / 5) * 100, 100),
    },
    {
      id: 'memory-match',
      title: 'Memory Matching',
      description: 'Match pairs of cards to exercise memory',
      icon: Heart,
      color: 'bg-gradient-to-br from-pink-400 to-pink-600',
      difficulty: 'Easy',
      duration: '15 min',
      progress: Math.min((userSessions.filter(s => s.gameType === 'memory-match').length / 5) * 100, 100),
    },
    {
      id: 'sequence-game',
      title: 'Pattern Sequences',
      description: 'Complete the pattern by finding what comes next',
      icon: Trophy,
      color: 'bg-gradient-to-br from-green-400 to-green-600',
      difficulty: 'Hard',
      duration: '12 min',
      progress: Math.min((userSessions.filter(s => s.gameType === 'pattern-sequence').length / 5) * 100, 100),
    },
  ];

  const quickActions = [
    {
      id: 'flashcards',
      title: 'Memory Cards',
      description: 'Review your personal flashcards',
      icon: Image,
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
      count: userFlashcards.length,
      bgPattern: 'bg-purple-50',
    },
    {
      id: 'journal',
      title: 'Memory Journal',
      description: 'Add to your story collection',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-orange-400 to-orange-600',
      count: userJournalEntries.length,
      bgPattern: 'bg-orange-50',
    },
    {
      id: 'calendar',
      title: 'Today\'s Schedule',
      description: 'See what\'s planned for today',
      icon: Calendar,
      color: 'bg-gradient-to-br from-teal-400 to-teal-600',
      count: userCalendarEvents.length,
      bgPattern: 'bg-teal-50',
    },
  ];

  const stats = [
    { label: 'Activities Completed', value: activitiesCompleted, icon: Target, color: 'text-blue-600' },
    { label: 'Current Streak', value: currentStreak, icon: Zap, color: 'text-yellow-600' },
    { label: 'Total Score', value: totalScore, icon: Star, color: 'text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 leading-tight">
              {getTimeBasedGreeting()}, {currentUser?.name}!
            </h1>
            <p className="text-xl text-gray-600">
              Ready for some gentle brain exercises and memory activities?
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-blue-100 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Your Progress This Week ✨
                </h3>
                <p className="text-lg text-gray-600 mb-6">
                  {activitiesCompleted > 0 
                    ? `You've completed ${activitiesCompleted} activities and are doing amazing!`
                    : 'Start your journey with brain training activities!'
                  }
                </p>
                <div className="flex space-x-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-3 mx-auto`}>
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                      </div>
                      <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-36 h-36 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Brain className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Activities */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 flex items-center">
            <Zap className="w-10 h-10 text-yellow-500 mr-4" />
            Today's Brain Activities
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => onNavigate('activities')}
                className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all text-left group transform hover:-translate-y-2"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-5 rounded-2xl ${activity.color} group-hover:scale-110 transition-transform shadow-xl`}>
                    <activity.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="font-medium text-lg">{activity.difficulty}</div>
                    <div className="text-base">{activity.duration}</div>
                  </div>
                </div>
                
                <h3 className="font-bold text-2xl text-gray-800 mb-4">
                  {activity.title}
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {activity.description}
                </p>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(activity.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${activity.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-blue-600 font-semibold text-lg group-hover:text-blue-700 transition-colors">
                  {activity.progress > 0 ? 'Continue Activity' : 'Start Activity'} →
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-4xl font-bold text-gray-800 mb-8 flex items-center">
            <Star className="w-10 h-10 text-purple-500 mr-4" />
            Quick Access
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className={`${action.bgPattern} rounded-3xl p-8 shadow-xl border-2 border-gray-100 hover:shadow-2xl hover:border-blue-300 transition-all text-left group transform hover:-translate-y-2`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className={`p-5 rounded-2xl ${action.color} group-hover:scale-110 transition-transform shadow-xl`}>
                    <action.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-bold text-gray-800">
                      {action.count}
                    </span>
                    <div className="text-sm text-gray-600">items</div>
                  </div>
                </div>
                
                <h3 className="font-bold text-2xl text-gray-800 mb-4">
                  {action.title}
                </h3>
                <p className="text-gray-600 mb-6 text-lg">
                  {action.description}
                </p>
                
                <div className="text-blue-600 font-semibold text-lg group-hover:text-blue-700 transition-colors">
                  Open {action.title} →
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Motivational Quote */}
        <div className="mt-12 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-3xl p-10 border-2 border-yellow-200 text-center shadow-xl">
          <div className="text-5xl mb-6">🌟</div>
          <blockquote className="text-2xl font-medium text-gray-800 mb-6">
            "Every small step you take today builds a stronger tomorrow. Your mind is amazing, and you're doing wonderfully!"
          </blockquote>
          <p className="text-gray-600 text-lg">Keep up the fantastic work!</p>
        </div>
      </div>
    </div>
  );
}