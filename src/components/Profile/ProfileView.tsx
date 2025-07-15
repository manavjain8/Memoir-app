import React, { useState } from 'react';
import { User, Camera, Edit3, Save, Calendar, Trophy, Heart, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function ProfileView() {
  const { state, dispatch } = useApp();
  const { currentUser, gameSessions, flashcards, journalEntries, achievements } = state;
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(currentUser);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editedUser) return;
    
    setIsSaving(true);
    dispatch({ type: 'SET_USER', payload: editedUser });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setIsEditing(false);
  };

  // Calculate real user stats
  const userSessions = gameSessions.filter(s => s.userId === currentUser?.id);
  const userFlashcards = flashcards.filter(f => f.createdBy === currentUser?.id);
  const userJournalEntries = journalEntries.filter(j => j.createdBy === currentUser?.id);
  const userAchievements = achievements.filter(a => a.userId === currentUser?.id);
  
  const stats = [
    { label: 'Activities Completed', value: userSessions.length, icon: Trophy, color: 'text-yellow-600 bg-yellow-100' },
    { label: 'Days Active', value: 1, icon: Calendar, color: 'text-blue-600 bg-blue-100' },
    { label: 'Memory Cards Created', value: userFlashcards.length, icon: Heart, color: 'text-pink-600 bg-pink-100' },
    { label: 'Journal Entries', value: userJournalEntries.length, icon: Edit3, color: 'text-green-600 bg-green-100' },
  ];

  const availableAchievements = [
    { title: 'First Steps', description: 'Completed your first activity', earned: userSessions.length > 0 },
    { title: 'Memory Keeper', description: 'Created 10 memory cards', earned: userFlashcards.length >= 10 },
    { title: 'Consistent Learner', description: 'Active for 7 days in a row', earned: false },
    { title: 'Story Teller', description: 'Write 5 journal entries', earned: userJournalEntries.length >= 5 },
    { title: 'Brain Champion', description: 'Complete 50 activities', earned: userSessions.length >= 50 },
  ];

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Track your progress and manage your personal information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border border-blue-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedUser?.name || ''}
                      onChange={(e) => setEditedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="text-2xl font-bold bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select
                      value={editedUser?.type || 'user'}
                      onChange={(e) => setEditedUser(prev => prev ? { ...prev, type: e.target.value as 'user' | 'caregiver' } : null)}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="user">User</option>
                      <option value="caregiver">Caregiver</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                    <p className="text-gray-600 capitalize">{currentUser.type} Account</p>
                    <p className="text-sm text-gray-500 mt-1">Member since {new Date().toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Achievements</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {availableAchievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.earned
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    achievement.earned ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {achievement.earned ? (
                      <Trophy className="w-4 h-4 text-white" />
                    ) : (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      achievement.earned ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${
                      achievement.earned ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}