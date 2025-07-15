import React, { useState, useEffect } from 'react';
import { 
  Type, 
  Eye, 
  Bell, 
  Save,
  User,
  Heart,
  Shield,
  HelpCircle,
  LogOut,
  Users,
  Plus,
  X,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function SettingsView() {
  const { state, dispatch } = useApp();
  const { currentUser } = state;
  const [settings, setSettings] = useState(currentUser?.settings || {
    fontSize: 'medium',
    highContrast: false,
    reminderFrequency: 'medium',
    preferredActivities: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionCode, setConnectionCode] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Generate user code
  const userCode = currentUser ? `MEM${currentUser.id.slice(-6).toUpperCase()}` : '';

  // Apply font size changes immediately with preview
  useEffect(() => {
    const root = document.documentElement;
    switch (settings.fontSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'extra-large':
        root.style.fontSize = '20px';
        break;
    }
  }, [settings.fontSize]);

  // Apply high contrast mode - ACTUALLY WORKING
  useEffect(() => {
    const body = document.body;
    if (settings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
  }, [settings.highContrast]);

  const handleSave = async () => {
    setIsSaving(true);
    dispatch({ type: 'UPDATE_USER_SETTINGS', payload: settings });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out? This will clear all your data.')) {
      localStorage.clear();
      dispatch({ type: 'LOGOUT' });
      window.location.reload();
    }
  };

  const handleConnectAccount = () => {
    if (!connectionCode.trim()) return;
    
    // Simulate connecting to another account
    const connectedUser = {
      id: connectionCode.replace('MEM', ''),
      name: `Connected User ${connectionCode}`,
      type: 'user' as const,
      profileCompleted: true,
      settings: settings,
      stats: {
        activitiesCompleted: Math.floor(Math.random() * 50),
        currentStreak: Math.floor(Math.random() * 10),
        totalScore: Math.floor(Math.random() * 5000),
      },
      connectedAccounts: [],
    };
    
    dispatch({ type: 'CONNECT_USER', payload: connectedUser });
    setConnectionCode('');
    setIsConnecting(false);
  };

  const copyUserCode = () => {
    navigator.clipboard.writeText(userCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const getFontSizePreview = (size: string) => {
    switch (size) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      case 'extra-large': return 'text-xl';
      default: return 'text-base';
    }
  };

  const settingsSections = [
    {
      title: 'Accessibility',
      icon: Eye,
      settings: [
        {
          key: 'fontSize',
          label: 'Text Size',
          type: 'select',
          options: [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'extra-large', label: 'Extra Large' },
          ]
        },
        {
          key: 'highContrast',
          label: 'High Contrast Mode',
          description: 'Black and white mode for better visibility',
          type: 'toggle'
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          key: 'reminderFrequency',
          label: 'Activity Reminders',
          type: 'select',
          options: [
            { value: 'low', label: 'Few reminders' },
            { value: 'medium', label: 'Some reminders' },
            { value: 'high', label: 'Many reminders' },
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Customize your Memoir experience for comfort and accessibility
          </p>
        </div>

        {/* Profile Summary with User Code */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-blue-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {currentUser?.name}
                </h2>
                <p className="text-gray-600 capitalize text-lg">
                  {currentUser?.type} Account
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Your Connection Code</p>
              <div className="flex items-center space-x-2">
                <span className="bg-white px-4 py-2 rounded-lg border-2 border-blue-200 font-mono text-lg font-bold text-blue-600">
                  {userCode}
                </span>
                <button
                  onClick={copyUserCode}
                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Share this code to connect accounts</p>
            </div>
          </div>
        </div>

        {/* Account Connections */}
        {currentUser?.type === 'caregiver' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Connected Accounts
                </h3>
              </div>
              <button
                onClick={() => setIsConnecting(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Connect Account</span>
              </button>
            </div>

            {state.connectedUsers.length > 0 ? (
              <div className="space-y-3">
                {state.connectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">
                        {user.stats.activitiesCompleted} activities completed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Streak: {user.stats.currentStreak} days</p>
                      <p className="text-sm text-gray-600">Score: {user.stats.totalScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No connected accounts yet. Connect with family members to track their progress.</p>
            )}

            {/* Connection Modal */}
            {isConnecting && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Connect Account</h3>
                    <button
                      onClick={() => setIsConnecting(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Connection Code
                      </label>
                      <input
                        type="text"
                        value={connectionCode}
                        onChange={(e) => setConnectionCode(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                        placeholder="Enter code (e.g., MEM123456)"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      Ask your family member for their connection code to link accounts and track progress together.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setIsConnecting(false)}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConnectAccount}
                      disabled={!connectionCode.trim()}
                      className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <section.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {section.title}
                </h3>
              </div>

              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-3">
                    <div className="flex-1">
                      <label className="block font-medium text-gray-800 mb-1">
                        {setting.label}
                      </label>
                      {setting.description && (
                        <p className="text-sm text-gray-600">
                          {setting.description}
                        </p>
                      )}
                      {setting.key === 'fontSize' && (
                        <p className={`mt-2 ${getFontSizePreview(settings.fontSize)} text-blue-600 font-medium`}>
                          Preview: This is how your text will look
                        </p>
                      )}
                    </div>

                    <div className="ml-6">
                      {setting.type === 'toggle' ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings[setting.key as keyof typeof settings] as boolean}
                            onChange={(e) => setSettings({
                              ...settings,
                              [setting.key]: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      ) : (
                        <select
                          value={settings[setting.key as keyof typeof settings] as string}
                          onChange={(e) => setSettings({
                            ...settings,
                            [setting.key]: e.target.value
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {setting.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Support & Help */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Support & Help
              </h3>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setShowHelp(true)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-800">Help & Tutorials</span>
                </div>
              </button>
              <button 
                onClick={() => setShowPrivacy(true)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-800">Privacy Settings</span>
                </div>
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-red-100 p-2 rounded-lg">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Account Actions
              </h3>
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left p-3 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-3 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Help & Tutorials</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Getting Started</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Complete your profile setup to personalize your experience</li>
                    <li>• Try different brain activities to find what you enjoy most</li>
                    <li>• Create memory cards with important people and places</li>
                    <li>• Write in your memory journal to track your thoughts</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Playing Games</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Start with easy difficulty and work your way up</li>
                    <li>• Take breaks between activities to avoid fatigue</li>
                    <li>• Your scores and progress are automatically saved</li>
                    <li>• Try to play a little bit each day to maintain your streak</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Connecting with Family</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Share your connection code with family members</li>
                    <li>• Caregivers can track progress across multiple accounts</li>
                    <li>• Set up calendar events for important appointments</li>
                    <li>• Use the journal to share memories with loved ones</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Modal */}
        {showPrivacy && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Privacy Settings</h3>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Data Protection</h4>
                  <p className="text-gray-600 mb-4">
                    Your personal information and activity data are stored securely on your device. 
                    We do not share your information with third parties without your explicit consent.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Account Connections</h4>
                  <p className="text-gray-600 mb-4">
                    When you connect accounts with family members, only progress data and scores are shared. 
                    Personal journal entries and memory cards remain private unless you choose to share them.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Data Deletion</h4>
                  <p className="text-gray-600 mb-4">
                    You can delete your account and all associated data at any time by using the logout function. 
                    This action cannot be undone.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Memoir is designed with privacy in mind. All data is stored locally 
                    on your device and is not transmitted to external servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center space-x-2 shadow-lg"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}