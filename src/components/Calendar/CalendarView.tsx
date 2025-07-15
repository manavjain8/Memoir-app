import React, { useState } from 'react';
import { Calendar, Clock, Plus, Bell, MapPin, User, X, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent } from '../../types';

export function CalendarView() {
  const { state, dispatch } = useApp();
  const { calendarEvents, currentUser } = state;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    description: '',
    type: 'appointment' as const,
    location: '',
    reminder: true,
  });

  const todayEvents = calendarEvents
    .filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.time.trim() || !currentUser) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title.trim(),
      time: newEvent.time,
      description: newEvent.description.trim(),
      type: newEvent.type,
      location: newEvent.location.trim() || undefined,
      reminder: newEvent.reminder,
      date: new Date(),
      createdBy: currentUser.id,
    };

    dispatch({ type: 'ADD_CALENDAR_EVENT', payload: event });
    setNewEvent({
      title: '',
      time: '',
      description: '',
      type: 'appointment',
      location: '',
      reminder: true,
    });
    setIsCreating(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      dispatch({ type: 'DELETE_CALENDAR_EVENT', payload: eventId });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'medication': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-200';
      case 'appointment': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-200';
      case 'activity': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 border-green-200';
      case 'social': return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 border-purple-200';
      default: return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-200';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'medication': return '💊';
      case 'appointment': return '🏥';
      case 'activity': return '🧠';
      case 'social': return '👥';
      default: return '📅';
    }
  };

  const eventTypeCounts = {
    total: calendarEvents.length,
    reminders: calendarEvents.filter(e => e.reminder).length,
    social: calendarEvents.filter(e => e.type === 'social').length,
    nextEvent: todayEvents[0]?.time || 'None',
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Today's Schedule
              </h1>
              <p className="text-gray-600 text-lg">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl transition-all flex items-center space-x-2 shadow-lg transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Create Event Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Add New Event</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter event title"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="appointment">Appointment</option>
                      <option value="medication">Medication</option>
                      <option value="activity">Activity</option>
                      <option value="social">Social</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Event description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (optional)
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Event location"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="reminder"
                    checked={newEvent.reminder}
                    onChange={(e) => setNewEvent({ ...newEvent, reminder: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="reminder" className="text-sm font-medium text-gray-700">
                    Set reminder
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title.trim() || !newEvent.time.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Event</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600">Total Events</p>
                <p className="text-xl font-bold text-blue-800">{eventTypeCounts.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600">Reminders</p>
                <p className="text-xl font-bold text-green-800">{eventTypeCounts.reminders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 p-2 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600">Social Events</p>
                <p className="text-xl font-bold text-purple-800">{eventTypeCounts.social}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600">Next Event</p>
                <p className="text-lg font-bold text-orange-800">{eventTypeCounts.nextEvent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Timeline */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Events</h2>
          
          {todayEvents.length > 0 ? (
            <div className="space-y-4">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`border-2 rounded-xl p-4 transition-all hover:shadow-md ${getEventTypeColor(event.type)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{getEventIcon(event.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <div className="flex items-center space-x-1 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm mb-2">{event.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.reminder && (
                            <div className="flex items-center space-x-1">
                              <Bell className="w-4 h-4" />
                              <span>Reminder set</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-white bg-opacity-50 rounded-full text-xs font-medium capitalize">
                        {event.type}
                      </span>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No events scheduled for today
              </h3>
              <p className="text-gray-500 mb-6">
                Add events to keep track of your daily schedule
              </p>
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Add First Event
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Events Preview */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="font-medium text-gray-800">Set Reminders</p>
                  <p className="text-sm text-gray-600">Enable reminders for important events</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📱</span>
                <div>
                  <p className="font-medium text-gray-800">Stay Organized</p>
                  <p className="text-sm text-gray-600">Add locations and descriptions for clarity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}