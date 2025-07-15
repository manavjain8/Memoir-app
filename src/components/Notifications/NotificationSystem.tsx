import React, { useState, useEffect } from 'react';
import { X, Trophy, Heart, Star, Calendar, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Notification {
  id: string;
  type: 'achievement' | 'encouragement' | 'reminder' | 'milestone';
  title: string;
  message: string;
  icon: React.ReactNode;
  duration: number;
}

export function NotificationSystem() {
  const { state } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<Set<string>>(new Set());

  const encouragementMessages = [
    {
      title: "You're doing great!",
      message: "Every activity you complete strengthens your mind. Keep it up!",
      icon: <Heart className="w-5 h-5" />,
    },
    {
      title: "Amazing progress!",
      message: "Your dedication to brain training is inspiring. You're building stronger neural pathways!",
      icon: <Star className="w-5 h-5" />,
    },
    {
      title: "Keep going!",
      message: "Each challenge you face makes you stronger. You're doing wonderfully!",
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      title: "Fantastic effort!",
      message: "Your commitment to cognitive health is admirable. Every step counts!",
      icon: <Heart className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    // Show encouragement notification based on reminder frequency
    const frequency = state.currentUser?.settings.reminderFrequency || 'medium';
    const intervals = {
      low: 600000,    // 10 minutes
      medium: 300000, // 5 minutes
      high: 180000    // 3 minutes
    };

    const encouragementInterval = setInterval(() => {
      if (state.currentUser) {
        showEncouragementNotification();
      }
    }, intervals[frequency]);

    // Show initial welcome notification only once
    const welcomeShown = sessionStorage.getItem('memoir-welcome-shown');
    if (state.currentUser && !welcomeShown) {
      setTimeout(() => {
        showNotification({
          type: 'encouragement',
          title: 'Welcome back!',
          message: 'Ready for some brain training? You\'re doing amazing!',
          icon: <Heart className="w-5 h-5" />,
          duration: 5000,
        });
        sessionStorage.setItem('memoir-welcome-shown', 'true');
      }, 2000);
    }

    return () => clearInterval(encouragementInterval);
  }, [state.currentUser?.settings.reminderFrequency]);

  // Show reminders for calendar events - FIXED DUPLICATE BUG
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = now.toDateString();
      
      state.calendarEvents.forEach(event => {
        const eventDate = new Date(event.date).toDateString();
        const reminderKey = `${event.id}-${today}-${currentTime}`;
        
        // Only show reminder if: event is today, has reminder enabled, time matches, user created it, and not already shown
        if (event.reminder && 
            eventDate === today && 
            event.time === currentTime && 
            event.createdBy === state.currentUser?.id &&
            !notificationHistory.has(reminderKey)) {
          
          showReminderNotification(event.title, `It's time for: ${event.description}`);
          setNotificationHistory(prev => new Set(prev).add(reminderKey));
        }
      });
    };

    const reminderInterval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(reminderInterval);
  }, [state.calendarEvents, state.currentUser?.id, notificationHistory]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    // Create unique key for this notification
    const notificationKey = `${notification.type}-${notification.title}-${notification.message}`;
    
    // Prevent duplicate notifications completely
    if (notificationHistory.has(notificationKey)) {
      return;
    }
    
    setNotificationHistory(prev => new Set(prev).add(notificationKey));

    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration);
  };

  const showEncouragementNotification = () => {
    const randomMessage = encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
    showNotification({
      type: 'encouragement',
      ...randomMessage,
      duration: 4000,
    });
  };

  const showAchievementNotification = (title: string, message: string) => {
    showNotification({
      type: 'achievement',
      title,
      message,
      icon: <Trophy className="w-5 h-5" />,
      duration: 6000,
    });
  };

  const showReminderNotification = (title: string, message: string) => {
    showNotification({
      type: 'reminder',
      title,
      message,
      icon: <Bell className="w-5 h-5" />,
      duration: 8000,
    });
  };

  const showMilestoneNotification = (title: string, message: string) => {
    showNotification({
      type: 'milestone',
      title,
      message,
      icon: <Star className="w-5 h-5" />,
      duration: 7000,
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-xl';
      case 'encouragement':
        return 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-xl';
      case 'reminder':
        return 'bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-xl';
      case 'milestone':
        return 'bg-gradient-to-r from-pink-400 to-red-400 text-white shadow-xl';
      default:
        return 'bg-white text-gray-800 border border-gray-200 shadow-lg';
    }
  };

  // Expose functions globally for other components to use
  useEffect(() => {
    (window as any).showAchievementNotification = showAchievementNotification;
    (window as any).showReminderNotification = showReminderNotification;
    (window as any).showEncouragementNotification = showEncouragementNotification;
    (window as any).showMilestoneNotification = showMilestoneNotification;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm p-5 rounded-2xl transform transition-all duration-300 ease-in-out animate-slide-in ${getNotificationStyles(notification.type)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm opacity-90">
                  {notification.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}