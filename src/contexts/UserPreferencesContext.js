import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
};

export const UserPreferencesProvider = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    allergens: [],
    dietaryRestrictions: [],
    healthGoals: [],
    notificationSettings: {
      allergenAlerts: true,
      dailyReminder: false,
      weeklyReport: true
    }
  });

  const commonAllergens = [
    'Peanuts',
    'Tree Nuts',
    'Milk',
    'Eggs',
    'Wheat',
    'Soy',
    'Fish',
    'Shellfish',
    'Sesame',
    'Gluten'
  ];

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Kosher',
    'Halal',
    'Low Sodium',
    'Low Sugar',
    'Keto',
    'Paleo'
  ];

  const healthGoalOptions = [
    'Weight Loss',
    'Muscle Gain',
    'Heart Health',
    'Diabetes Management',
    'Lower Cholesterol',
    'Better Digestion',
    'Energy Boost',
    'Immune Support'
  ];

  useEffect(() => {
    if (user) {
      const storedPreferences = localStorage.getItem(`labelai_preferences_${user.id}`);
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      }
    }
  }, [user]);

  const savePreferences = (newPreferences) => {
    if (user) {
      setPreferences(newPreferences);
      localStorage.setItem(`labelai_preferences_${user.id}`, JSON.stringify(newPreferences));
    }
  };

  const addAllergen = (allergen) => {
    const updated = {
      ...preferences,
      allergens: [...new Set([...preferences.allergens, allergen])]
    };
    savePreferences(updated);
  };

  const removeAllergen = (allergen) => {
    const updated = {
      ...preferences,
      allergens: preferences.allergens.filter(a => a !== allergen)
    };
    savePreferences(updated);
  };

  const toggleDietaryRestriction = (restriction) => {
    const updated = {
      ...preferences,
      dietaryRestrictions: preferences.dietaryRestrictions.includes(restriction)
        ? preferences.dietaryRestrictions.filter(r => r !== restriction)
        : [...preferences.dietaryRestrictions, restriction]
    };
    savePreferences(updated);
  };

  const toggleHealthGoal = (goal) => {
    const updated = {
      ...preferences,
      healthGoals: preferences.healthGoals.includes(goal)
        ? preferences.healthGoals.filter(g => g !== goal)
        : [...preferences.healthGoals, goal]
    };
    savePreferences(updated);
  };

  const updateNotificationSettings = (settings) => {
    const updated = {
      ...preferences,
      notificationSettings: {
        ...preferences.notificationSettings,
        ...settings
      }
    };
    savePreferences(updated);
  };

  const checkForAllergens = (ingredients) => {
    if (!ingredients || preferences.allergens.length === 0) return [];
    
    const foundAllergens = [];
    const lowerIngredients = ingredients.toLowerCase();
    
    preferences.allergens.forEach(allergen => {
      if (lowerIngredients.includes(allergen.toLowerCase())) {
        foundAllergens.push(allergen);
      }
    });
    
    return foundAllergens;
  };

  const value = {
    preferences,
    commonAllergens,
    dietaryOptions,
    healthGoalOptions,
    addAllergen,
    removeAllergen,
    toggleDietaryRestriction,
    toggleHealthGoal,
    updateNotificationSettings,
    checkForAllergens,
    savePreferences
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};