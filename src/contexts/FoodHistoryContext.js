import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FoodHistoryContext = createContext();

export const useFoodHistory = () => {
  const context = useContext(FoodHistoryContext);
  if (!context) {
    throw new Error('useFoodHistory must be used within FoodHistoryProvider');
  }
  return context;
};

export const FoodHistoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalScanned: 0,
    totalEaten: 0,
    averageHealthScore: 0,
    todayEaten: 0,
    weeklyAverage: 0,
    monthlyTrend: 'stable'
  });

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
      setStats({
        totalScanned: 0,
        totalEaten: 0,
        averageHealthScore: 0,
        todayEaten: 0,
        weeklyAverage: 0,
        monthlyTrend: 'stable'
      });
    }
  }, [user]);

  const loadHistory = () => {
    if (!user) return;
    
    const storedHistory = localStorage.getItem(`labelai_food_history_${user.id}`);
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory);
      setHistory(parsedHistory);
      calculateStats(parsedHistory);
    }
  };

  const saveHistory = (newHistory) => {
    if (!user) return;
    
    localStorage.setItem(`labelai_food_history_${user.id}`, JSON.stringify(newHistory));
    setHistory(newHistory);
    calculateStats(newHistory);
  };

  const addFoodItem = (foodData) => {
    if (!user) return;

    const newItem = {
      id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...foodData,
      scannedAt: new Date().toISOString(),
      userId: user.id,
      eaten: false,
      eatenAt: null,
      notes: ''
    };

    const updatedHistory = [newItem, ...history];
    saveHistory(updatedHistory);
    return newItem;
  };

  const markAsEaten = (itemId, eaten = true) => {
    const updatedHistory = history.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          eaten,
          eatenAt: eaten ? new Date().toISOString() : null
        };
      }
      return item;
    });
    saveHistory(updatedHistory);
  };

  const updateItemNotes = (itemId, notes) => {
    const updatedHistory = history.map(item => {
      if (item.id === itemId) {
        return { ...item, notes };
      }
      return item;
    });
    saveHistory(updatedHistory);
  };

  const deleteItem = (itemId) => {
    const updatedHistory = history.filter(item => item.id !== itemId);
    saveHistory(updatedHistory);
  };

  const calculateStats = (historyData) => {
    if (!historyData || historyData.length === 0) {
      setStats({
        totalScanned: 0,
        totalEaten: 0,
        averageHealthScore: 0,
        todayEaten: 0,
        weeklyAverage: 0,
        monthlyTrend: 'stable'
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const eatenItems = historyData.filter(item => item.eaten);
    const todayItems = eatenItems.filter(item => {
      const itemDate = new Date(item.eatenAt);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });

    const weekItems = eatenItems.filter(item => 
      new Date(item.eatenAt) >= weekAgo
    );

    const monthItems = eatenItems.filter(item => 
      new Date(item.eatenAt) >= monthAgo
    );

    const avgHealthScore = eatenItems.length > 0
      ? eatenItems.reduce((sum, item) => sum + (item.healthScore || 0), 0) / eatenItems.length
      : 0;

    const weeklyAvg = weekItems.length > 0
      ? weekItems.reduce((sum, item) => sum + (item.healthScore || 0), 0) / weekItems.length
      : 0;

    const firstHalfMonth = monthItems.filter(item => {
      const itemDate = new Date(item.eatenAt);
      const halfMonth = new Date(monthAgo);
      halfMonth.setDate(halfMonth.getDate() + 15);
      return itemDate < halfMonth;
    });

    const secondHalfMonth = monthItems.filter(item => {
      const itemDate = new Date(item.eatenAt);
      const halfMonth = new Date(monthAgo);
      halfMonth.setDate(halfMonth.getDate() + 15);
      return itemDate >= halfMonth;
    });

    const firstHalfAvg = firstHalfMonth.length > 0
      ? firstHalfMonth.reduce((sum, item) => sum + (item.healthScore || 0), 0) / firstHalfMonth.length
      : 0;

    const secondHalfAvg = secondHalfMonth.length > 0
      ? secondHalfMonth.reduce((sum, item) => sum + (item.healthScore || 0), 0) / secondHalfMonth.length
      : 0;

    let trend = 'stable';
    if (firstHalfMonth.length > 0 && secondHalfMonth.length > 0) {
      if (secondHalfAvg > firstHalfAvg + 5) trend = 'improving';
      else if (secondHalfAvg < firstHalfAvg - 5) trend = 'declining';
    }

    setStats({
      totalScanned: historyData.length,
      totalEaten: eatenItems.length,
      averageHealthScore: Math.round(avgHealthScore),
      todayEaten: todayItems.length,
      weeklyAverage: Math.round(weeklyAvg),
      monthlyTrend: trend
    });
  };

  const getRecentItems = (limit = 10) => {
    return history.slice(0, limit);
  };

  const getEatenItems = () => {
    return history.filter(item => item.eaten);
  };

  const getItemsByDateRange = (startDate, endDate) => {
    return history.filter(item => {
      const itemDate = new Date(item.scannedAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  const getTodayItems = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return getItemsByDateRange(today, tomorrow);
  };

  const getHealthTrends = (days = 30) => {
    const trends = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayItems = history.filter(item => {
        if (!item.eaten) return false;
        const itemDate = new Date(item.eatenAt);
        return itemDate >= date && itemDate < nextDate;
      });
      
      const avgScore = dayItems.length > 0
        ? dayItems.reduce((sum, item) => sum + (item.healthScore || 0), 0) / dayItems.length
        : null;
      
      trends.push({
        date: date.toISOString().split('T')[0],
        score: avgScore ? Math.round(avgScore) : null,
        count: dayItems.length
      });
    }
    
    return trends;
  };

  const value = {
    history,
    stats,
    addFoodItem,
    markAsEaten,
    updateItemNotes,
    deleteItem,
    getRecentItems,
    getEatenItems,
    getItemsByDateRange,
    getTodayItems,
    getHealthTrends,
    loadHistory
  };

  return (
    <FoodHistoryContext.Provider value={value}>
      {children}
    </FoodHistoryContext.Provider>
  );
};