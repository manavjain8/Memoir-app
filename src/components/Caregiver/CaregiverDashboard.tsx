import React, { useState } from 'react';
import { Heart, User, Calendar, BookOpen, Image, BarChart3, Clock, Trophy, TrendingUp, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function CaregiverDashboard() {
  const { state } = useApp();
  const { connectedUsers, gameSessions, flashcards, journalEntries, calendarEvents } = state;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    connectedUsers.length > 0 ? connectedUsers[0].id : null
  );

  const selectedUser = connectedUsers.find(u => u.id === selectedUserId);
  const userSessions = selectedUser ? gameSessions.filter(s => s.userId === selectedUser.id) : [];
  const userFlashcards = selectedUser ? flashcards.filter(f => f.createdBy === selectedUser.id) : [];
  const userJournalEntries = selectedUser ? journalEntries.filter(j => j.createdBy === selectedUser.id) : [];
  const userCalendarEvents = selectedUser ? calendarEvents.filter(e => e.createdBy === selectedUser.id) : [];

  // Calculate recent activity (last 7 days)
  const recentSessions = userSessions.filter(session => {
    const sessionDate = new Date(session.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate >= weekAgo;
  });

  const todayEvents = userCalendarEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Caregiver Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Monitor progress and support your loved ones' cognitive health journey
          </p>
        </div>

        {connectedUsers.length > 0 ? (
          <div className="space-y-8">
            {/* User Selection */}
            {connectedUsers.length > 1 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select User to Monitor</h3>
                <div className="flex flex-wrap gap-3">
                  {connectedUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedUserId === user.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 text-gray-700'
                      }`}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedUser && (
              <>
                {/* User Overview */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-600">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{selectedUser.name}</h2>
                      <p className="text-gray-600 text-lg">Connected User</p>
                      <p className="text-sm text-gray-500">
                        Member since {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{userSessions.length}</div>
                      <div className="text-sm text-gray-600">Total Activities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{selectedUser.stats.currentStreak}</div>
                      <div className="text-sm text-gray-600">Current Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{userFlashcards.length}</div>
                      <div className="text-sm text-gray-600">Memory Cards</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">{selectedUser.stats.totalScore}</div>
                      <div className="text-sm text-gray-600">Total Score</div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-800">{recentSessions.length}</div>
                    </div>
                    <p className="text-gray-600 text-sm">Activities This Week</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {recentSessions.length > 0 ? Math.round(recentSessions.reduce((sum, s) => sum + s.score, 0) / recentSessions.length) : 0}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">Average Score</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-800">{userJournalEntries.length}</div>
                    </div>
                    <p className="text-gray-600 text-sm">Journal Entries</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-orange-100 p-3 rounded-lg">
                        <Calendar className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-800">{todayEvents.length}</div>
                    </div>
                    <p className="text-gray-600 text-sm">Today's Events</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                    Recent Activity
                  </h3>
                  {userSessions.length > 0 ? (
                    <div className="space-y-4">
                      {userSessions
                        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                        .slice(0, 8)
                        .map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {session.gameType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(session.completedAt).toLocaleDateString()} • Score: {session.score}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                session.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                session.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {session.difficulty}
                              </span>
                              <p className="text-xs text-gray-500 mt-1">
                                {Math.floor(session.duration / 60)}m {session.duration % 60}s
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No activities completed yet.</p>
                  )}
                </div>

                {/* Memory Cards Overview */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Image className="w-6 h-6 mr-3 text-purple-600" />
                    Memory Cards ({userFlashcards.length})
                  </h3>
                  {userFlashcards.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userFlashcards.slice(0, 6).map((card) => (
                        <div key={card.id} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 mb-2">{card.title}</h4>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{card.frontText}</p>
                          <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs capitalize">
                            {card.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No memory cards created yet.</p>
                  )}
                </div>

                {/* Journal Entries Overview */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <BookOpen className="w-6 h-6 mr-3 text-green-600" />
                    Recent Journal Entries ({userJournalEntries.length})
                  </h3>
                  {userJournalEntries.length > 0 ? (
                    <div className="space-y-4">
                      {userJournalEntries
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((entry) => (
                          <div key={entry.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 mb-2">{entry.title}</h4>
                                <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-xs text-gray-500">
                                  {new Date(entry.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No journal entries yet.</p>
                  )}
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-orange-600" />
                    Today's Schedule ({todayEvents.length})
                  </h3>
                  {todayEvents.length > 0 ? (
                    <div className="space-y-3">
                      {todayEvents
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <Clock className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{event.title}</p>
                                <p className="text-sm text-gray-600">{event.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-800">{event.time}</p>
                              <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs capitalize">
                                {event.type}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No events scheduled for today.</p>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No Connected Users</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Connect with family members to monitor their progress and provide support on their cognitive health journey.
            </p>
            <p className="text-sm text-blue-600 bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
              Use the Settings page to connect accounts using connection codes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}