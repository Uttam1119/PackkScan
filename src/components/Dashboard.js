import React, { useEffect, useState } from 'react';
import { useFoodHistory } from '../contexts/FoodHistoryContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CameraIcon,
  ClockIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, getRecentItems, getHealthTrends, history } = useFoodHistory();
  const { preferences } = useUserPreferences();
  const [recentItems, setRecentItems] = useState([]);
  const [healthTrends, setHealthTrends] = useState([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const items = getRecentItems(5);
    setRecentItems(items);

    const trends = getHealthTrends(7);
    setHealthTrends(trends);

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, [history]);

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score) => {
    if (score >= 80) return 'bg-gradient-to-br from-green-400 to-green-600';
    if (score >= 50) return 'bg-gradient-to-br from-yellow-400 to-yellow-600';
    return 'bg-gradient-to-br from-red-400 to-red-600';
  };

  const getTrendIcon = () => {
    if (stats.monthlyTrend === 'improving') {
      return <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />;
    } else if (stats.monthlyTrend === 'declining') {
      return <ArrowTrendingDownIcon className="h-8 w-8 text-red-500" />;
    }
    return <ChartBarIcon className="h-8 w-8 text-gray-500" />;
  };

  const getMotivationalMessage = () => {
    if (stats.averageHealthScore >= 80) {
      return "🌟 Excellent! You're making fantastic food choices!";
    } else if (stats.averageHealthScore >= 60) {
      return "👍 Good job! Keep improving your healthy eating habits.";
    } else if (stats.averageHealthScore >= 40) {
      return "💪 Room for improvement. Small changes make big differences!";
    } else if (stats.averageHealthScore > 0) {
      return "🎯 Let's work on healthier choices. You can do this!";
    }
    return "📸 Start scanning to track your health journey!";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    {/* Header */}
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {greeting}, {user?.name?.split(' ')[0] || user?.username}! 👋
            </h1>
            <p className="text-slate-600 mt-1">{getMotivationalMessage()}</p>
          </div>
          <button
            onClick={() => navigate('/scan')}
            className="bg-slate-800 text-white px-6 py-3 rounded-lg hover:bg-slate-900 transition-colors flex items-center shadow"
          >
            <CameraIcon className="h-5 w-5 mr-2" />
            Scan Food
          </button>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          className={`${getHealthScoreBg(stats.averageHealthScore)} rounded-xl shadow p-6 text-white relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <TrophyIcon className="h-24 w-24" />
          </div>
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1">Average Health Score</p>
            <div className="text-4xl font-bold mb-1">{stats.averageHealthScore || 0}</div>
            <p className="text-white/70 text-xs">Out of 100</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <CalendarIcon className="h-8 w-8 text-sky-500" />
            <span className="text-2xl font-bold text-slate-800">{stats.todayEaten}</span>
          </div>
          <p className="text-sm font-medium text-slate-700">Today's Items</p>
          <p className="text-xs text-slate-500 mt-1">Foods tracked today</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <FireIcon className="h-8 w-8 text-amber-500" />
            <span className={`text-2xl font-bold ${getHealthScoreColor(stats.weeklyAverage)}`}>
              {stats.weeklyAverage || 0}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-700">Weekly Average</p>
          <p className="text-xs text-slate-500 mt-1">Last 7 days score</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            {getTrendIcon()}
            <span
              className={`text-lg font-bold ${
                stats.monthlyTrend === 'improving'
                  ? 'text-emerald-600'
                  : stats.monthlyTrend === 'declining'
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              {stats.monthlyTrend === 'improving'
                ? '↑ Improving'
                : stats.monthlyTrend === 'declining'
                ? '↓ Declining'
                : '→ Stable'}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-700">Monthly Trend</p>
          <p className="text-xs text-slate-500 mt-1">Based on 30 days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">7-Day Health Trend</h2>
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              View Full History →
            </button>
          </div>

          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              data={healthTrends.map((trend) => ({
                ...trend,
                day: new Date(trend.date).toLocaleDateString('en', { weekday: 'short' }),
                fillColor:
                  trend.score >= 80 ? '#059669' : trend.score >= 50 ? '#d97706' : '#dc2626'
              }))}
            >
              <XAxis dataKey="day" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    return (
                      <div className="bg-white p-2 border border-slate-200 rounded shadow">
                        <p className="text-sm font-medium">{payload[0].payload.day}</p>
                        <p className="text-sm">Score: {payload[0].value || 'No data'}</p>
                        {payload[0].payload.count > 0 && (
                          <p className="text-xs text-slate-500">{payload[0].payload.count} items</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="score" fill={(entry) => entry.fillColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/scan')}
              className="w-full bg-slate-50 text-slate-800 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center">
                <CameraIcon className="h-5 w-5 mr-3" />
                <span className="font-medium">Scan New Food</span>
              </div>
              <span className="text-slate-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={() => navigate('/history')}
              className="w-full bg-sky-50 text-sky-700 px-4 py-3 rounded-lg hover:bg-sky-100 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-3" />
                <span className="font-medium">Food History</span>
              </div>
              <span className="text-sky-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center">
                <HeartIcon className="h-5 w-5 mr-3" />
                <span className="font-medium">Health Goals</span>
              </div>
              <span className="text-emerald-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            View All →
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div className="text-center py-8">
            <CameraIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No food items scanned yet</p>
            <button
              onClick={() => navigate('/scan')}
              className="mt-3 text-sky-600 hover:text-sky-700 font-medium"
            >
              Start Scanning →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate('/history')}
              >
                <div className="flex items-center flex-1">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-800">{item.name}</p>
                      {item.eaten ? (
                        <CheckBadgeIcon className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ClockIcon className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {formatDate(item.scannedAt)} at {formatTime(item.scannedAt)}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.healthScore >= 80
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.healthScore >= 50
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.healthScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allergen Alert Banner */}
      {preferences.allergens.length > 0 && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">Allergen Protection Active</p>
              <p className="text-sm text-amber-700 mt-1">
                Monitoring for: {preferences.allergens.slice(0, 3).join(', ')}
                {preferences.allergens.length > 3 &&
                  ` and ${preferences.allergens.length - 3} more`}
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-sm text-amber-700 hover:text-amber-800 font-medium"
            >
              Manage →
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default Dashboard;