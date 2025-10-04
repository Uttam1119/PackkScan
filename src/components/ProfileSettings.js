import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { 
  XMarkIcon, 
  PlusIcon, 
  ExclamationTriangleIcon,
  HeartIcon,
  BellIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

const ProfileSettings = ({ onBack }) => {
  const { user } = useAuth();
  const {
    preferences,
    commonAllergens,
    dietaryOptions,
    healthGoalOptions,
    addAllergen,
    removeAllergen,
    toggleDietaryRestriction,
    toggleHealthGoal,
    updateNotificationSettings
  } = useUserPreferences();

  const [customAllergen, setCustomAllergen] = useState('');
  const [activeTab, setActiveTab] = useState('allergens');

  const handleAddCustomAllergen = () => {
    if (customAllergen.trim()) {
      addAllergen(customAllergen.trim());
      setCustomAllergen('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {user?.name || 'Not set'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {user?.email || 'Not set'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Member Since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('allergens')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'allergens'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                Allergens
              </button>
              <button
                onClick={() => setActiveTab('dietary')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'dietary'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Dietary Preferences
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'goals'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <HeartIcon className="h-5 w-5 inline mr-2" />
                Health Goals
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BellIcon className="h-5 w-5 inline mr-2" />
                Notifications
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Allergens Tab */}
            {activeTab === 'allergens' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Manage Your Allergens</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select allergens you want to be warned about when scanning food labels.
                </p>
                
                {/* Current Allergens */}
                {preferences.allergens.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Your Allergens</h4>
                    <div className="flex flex-wrap gap-2">
                      {preferences.allergens.map(allergen => (
                        <span
                          key={allergen}
                          className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                        >
                          {allergen}
                          <button
                            onClick={() => removeAllergen(allergen)}
                            className="ml-2 hover:text-red-900"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Common Allergens */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Common Allergens</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {commonAllergens.map(allergen => (
                      <button
                        key={allergen}
                        onClick={() => preferences.allergens.includes(allergen) 
                          ? removeAllergen(allergen) 
                          : addAllergen(allergen)
                        }
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                          preferences.allergens.includes(allergen)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {allergen}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Allergen */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Add Custom Allergen</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAllergen}
                      onChange={(e) => setCustomAllergen(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAllergen()}
                      placeholder="Enter allergen name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={handleAddCustomAllergen}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dietary Preferences Tab */}
            {activeTab === 'dietary' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Dietary Preferences</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select your dietary restrictions and preferences.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dietaryOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => toggleDietaryRestriction(option)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                        preferences.dietaryRestrictions.includes(option)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Health Goals Tab */}
            {activeTab === 'goals' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Health Goals</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select your health goals to get personalized recommendations.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {healthGoalOptions.map(goal => (
                    <button
                      key={goal}
                      onClick={() => toggleHealthGoal(goal)}
                      className={`p-3 rounded-lg text-sm font-medium transition-colors text-left ${
                        preferences.healthGoals.includes(goal)
                          ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <HeartIcon className="h-4 w-4 inline mr-2" />
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Allergen Alerts</p>
                      <p className="text-sm text-gray-600">Get warned when scanned items contain your allergens</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.allergenAlerts}
                      onChange={(e) => updateNotificationSettings({ allergenAlerts: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Reminder</p>
                      <p className="text-sm text-gray-600">Remind me to log my meals daily</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.dailyReminder}
                      onChange={(e) => updateNotificationSettings({ dailyReminder: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-gray-600">Get weekly health score summary</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.notificationSettings.weeklyReport}
                      onChange={(e) => updateNotificationSettings({ weeklyReport: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;