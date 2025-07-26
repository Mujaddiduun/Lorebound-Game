import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Zap, Star, Users, Gift } from 'lucide-react';

const EventsPanel = ({ wallet, backendUrl, onNotification }) => {
  const [activeEvents, setActiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [participatedEvents, setParticipatedEvents] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
    // Refresh events every minute
    const interval = setInterval(fetchEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/events/active`);
      if (response.ok) {
        const data = await response.json();
        setActiveEvents(data.active_events || []);
        setUpcomingEvents(data.upcoming_events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const participateInEvent = async (eventId) => {
    if (!wallet.publicKey) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/events/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: wallet.publicKey.toString(),
          event_id: eventId
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setParticipatedEvents(prev => new Set([...prev, eventId]));
        onNotification(data.message);
      }
    } catch (error) {
      console.error('Error participating in event:', error);
      onNotification('Error joining event');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getTimeUntilStart = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;
    
    if (diff <= 0) return 'Started';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Starts in ${days}d ${hours % 24}h`;
    }
    
    return `Starts in ${hours}h ${minutes}m`;
  };

  const getEventIcon = (eventId) => {
    if (eventId.includes('lunar')) return '🌙';
    if (eventId.includes('shadow')) return '🌑';
    if (eventId.includes('fire')) return '🔥';
    if (eventId.includes('crystal')) return '💎';
    return '⭐';
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <Calendar className="w-6 h-6 mr-2 text-yellow-400" />
        Time-Gated Events
      </h2>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center">
            <Zap className="w-5 h-5 mr-1" />
            Active Events
          </h3>
          <div className="space-y-3">
            {activeEvents.map((event) => (
              <div
                key={event.event_id}
                className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-4 border border-yellow-500/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getEventIcon(event.event_id)}</span>
                    <div>
                      <h4 className="font-semibold text-white">{event.name}</h4>
                      <p className="text-sm text-gray-300">{event.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-yellow-400 mb-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {getTimeRemaining(event.end_time)}
                    </div>
                    <div className="text-xs text-gray-400">remaining</div>
                  </div>
                </div>

                {/* Event Rewards */}
                <div className="bg-black/40 rounded-lg p-3 mb-3">
                  <h5 className="font-semibold text-yellow-400 mb-2 flex items-center">
                    <Gift className="w-4 h-4 mr-1" />
                    Active Bonuses
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {event.rewards.xp_multiplier && (
                      <div className="text-blue-400">
                        🚀 {event.rewards.xp_multiplier}x XP Multiplier
                      </div>
                    )}
                    {event.rewards.special_trait && (
                      <div className="text-purple-400">
                        ✨ Special Trait: {event.rewards.special_trait}
                      </div>
                    )}
                    {event.rewards.special_mission && (
                      <div className="text-green-400">
                        🗝️ Unlocks: {event.rewards.special_mission}
                      </div>
                    )}
                    {event.rewards.trait_bonus && Object.entries(event.rewards.trait_bonus).map(([trait, bonus]) => (
                      <div key={trait} className="text-purple-400">
                        ⭐ {trait}: +{bonus} bonus
                      </div>
                    ))}
                  </div>
                </div>

                {/* Participation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-300">
                    <Users className="w-4 h-4 mr-1" />
                    {event.participants.length} participants
                  </div>
                  
                  {!participatedEvents.has(event.event_id) ? (
                    <button
                      onClick={() => participateInEvent(event.event_id)}
                      disabled={loading}
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {loading ? 'Joining...' : 'Join Event'}
                    </button>
                  ) : (
                    <div className="bg-green-600/20 text-green-400 px-4 py-2 rounded-lg text-sm">
                      ✓ Participating
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-1" />
            Upcoming Events
          </h3>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.event_id}
                className="bg-blue-600/20 rounded-lg p-4 border border-blue-500/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl opacity-50">{getEventIcon(event.event_id)}</span>
                    <div>
                      <h4 className="font-semibold text-white">{event.name}</h4>
                      <p className="text-sm text-gray-300">{event.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-400">
                      {getTimeUntilStart(event.start_time)}
                    </div>
                  </div>
                </div>

                {/* Preview of rewards */}
                <div className="mt-3 text-xs text-gray-400">
                  Rewards: {Object.keys(event.rewards).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Events */}
      {activeEvents.length === 0 && upcomingEvents.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No Events Active</h3>
          <p className="text-gray-500">
            Check back later for special time-limited events and bonuses
          </p>
        </div>
      )}
    </div>
  );
};

export default EventsPanel;