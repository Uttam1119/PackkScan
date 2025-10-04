import React, { useState, useEffect } from 'react';
import { useFoodHistory } from '../contexts/FoodHistoryContext';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartBarIcon,
  CalendarIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  TrashIcon,
  ChevronLeftIcon,
  ClockIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const FoodHistory = ({ onBack }) => {
  const { user } = useAuth();
  const {
    history,
    stats,
    deleteItem,
    getHealthTrends,
    getTodayItems
  } = useFoodHistory();

  const [dateRange, setDateRange] = useState(7); // days to show in trend
  const [healthTrends, setHealthTrends] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [groupedHistory, setGroupedHistory] = useState({});

  useEffect(() => {
    const trends = getHealthTrends(dateRange);
    setHealthTrends(trends);
    
    // Group eaten items by date
    const eatenItems = history.filter(item => item.eaten);
    const grouped = {};
    
    eatenItems.forEach(item => {
      const date = new Date(item.eatenAt || item.scannedAt);
      const dateKey = date.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: date,
          items: [],
          totalScore: 0
        };
      }
      
      grouped[dateKey].items.push(item);
      grouped[dateKey].totalScore += item.healthScore || 0;
    });
    
    // Calculate average score for each day
    Object.keys(grouped).forEach(key => {
      const group = grouped[key];
      group.averageScore = Math.round(group.totalScore / group.items.length);
    });
    
    setGroupedHistory(grouped);
  }, [history, dateRange]);

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };
  
  // Sort dates in descending order (most recent first)
  const sortedDateKeys = Object.keys(groupedHistory).sort((a, b) => 
    new Date(b) - new Date(a)
  );

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getTrendIcon = () => {
    if (stats.monthlyTrend === 'improving') {
      return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
    } else if (stats.monthlyTrend === 'declining') {
      return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
    }
    return <MinusIcon className="h-5 w-5 text-gray-600" />;
  };

  const getTrendText = () => {
    if (stats.monthlyTrend === 'improving') {
      return <span className="text-green-600">Improving</span>;
    } else if (stats.monthlyTrend === 'declining') {
      return <span className="text-red-600">Declining</span>;
    }
    return <span className="text-gray-600">Stable</span>;
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Food History</h1>
            </div>
            <div className="text-sm text-gray-600">
              Welcome back, {user?.name || user?.username}!
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Health Score</span>
              <ChartBarIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div className={`text-3xl font-bold ${getHealthScoreColor(stats.averageHealthScore)}`}>
              {stats.averageHealthScore}
            </div>
            <p className="text-xs text-gray-500 mt-1">Average from eaten items</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Today's Items</span>
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.todayEaten}</div>
            <p className="text-xs text-gray-500 mt-1">Foods eaten today</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Weekly Average</span>
              <FireIcon className="h-5 w-5 text-orange-600" />
            </div>
            <div className={`text-3xl font-bold ${getHealthScoreColor(stats.weeklyAverage)}`}>
              {stats.weeklyAverage}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Monthly Trend</span>
              {getTrendIcon()}
            </div>
            <div className="text-2xl font-bold">
              {getTrendText()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Based on 30 days</p>
          </div>
        </div>

        {/* Health Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Health Score Trend</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={healthTrends.map(trend => ({
              ...trend,
              dateLabel: new Date(trend.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateLabel" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                        <p className="text-sm font-semibold">{payload[0].payload.dateLabel}</p>
                        <p className="text-sm">Health Score: {payload[0].value || 'No data'}</p>
                        {payload[0].payload.count > 0 && (
                          <p className="text-xs text-gray-500">{payload[0].payload.count} items eaten</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
                name="Health Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Eaten Items Header */}
        <div className="bg-white rounded-lg shadow mb-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Your Food Journal</h2>
              <p className="text-sm text-gray-600 mt-1">
                {history.filter(i => i.eaten).length} items eaten • Grouped by date
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">Average Score:</div>
              <div className={`text-lg font-bold ${getHealthScoreColor(stats.averageHealthScore)}`}>
                {stats.averageHealthScore}
              </div>
            </div>
          </div>
        </div>

        {/* Food Items List - Grouped by Date */}
        <div className="space-y-6">
          {sortedDateKeys.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-500">No food consumed yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start tracking your meals to see your food journal
              </p>
            </div>
          ) : (
            sortedDateKeys.map(dateKey => {
              const group = groupedHistory[dateKey];
              return (
                <div key={dateKey} className="space-y-3">
                  {/* Date Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-700">
                      {formatDateHeader(dateKey)}
                    </h3>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500">
                        {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthScoreBg(group.averageScore)} ${getHealthScoreColor(group.averageScore)}`}>
                        Avg: {group.averageScore}
                      </span>
                    </div>
                  </div>
                  
                  {/* Items for this date */}
                  {group.items.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover mr-4"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          {item.eaten ? (
                            <CheckBadgeIcon className="h-5 w-5 text-green-600" />
                          ) : (
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>{formatDate(item.scannedAt)} at {formatTime(item.scannedAt)}</span>
                          {item.eaten && (
                            <span className="text-green-600">
                              Eaten: {formatDate(item.eatenAt)} at {formatTime(item.eatenAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthScoreBg(item.healthScore)} ${getHealthScoreColor(item.healthScore)}`}>
                            Score: {item.healthScore}
                          </span>
                          
                          {item.eatability && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              item.eatability === 'Safe for Daily' 
                                ? 'bg-green-100 text-green-700'
                                : item.eatability === 'Occasionally OK'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {item.eatability}
                            </span>
                          )}
                          
                          {item.mode && item.mode !== 'general' && (
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                              {item.mode === 'allergen' ? 'Allergen Check' : 'Diabetes Safe'}
                            </span>
                          )}
                        </div>

                        {item.notes && (
                          <p className="mt-2 text-sm text-gray-600 italic">Note: {item.notes}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this item?')) {
                          deleteItem(item.id);
                        }
                      }}
                      className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {selectedItem === item.id && item.analysisResults && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Analysis Details:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {item.analysisResults.breakdown && (
                          <>
                            <div>
                              <span className="text-gray-500">Sweeteners:</span>
                              <span className="ml-2 font-medium">{item.analysisResults.breakdown.sweeteners}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Preservatives:</span>
                              <span className="ml-2 font-medium">{item.analysisResults.breakdown.preservatives}</span>
                            </div>
                          </>
                        )}
                        {item.analysisResults.breakdown?.flagged && item.analysisResults.breakdown.flagged.length > 0 && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Flagged:</span>
                            <span className="ml-2 text-red-600 font-medium">
                              {item.analysisResults.breakdown.flagged.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                    className="mt-3 text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    {selectedItem === item.id ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
              </div>
            ))}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodHistory;