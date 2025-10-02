import React from 'react';

const ModeSelector = ({ currentMode, onModeChange }) => {
  const modes = [
    { id: 'general', name: 'General', description: 'Standard food safety analysis' },
    { id: 'allergen', name: 'Allergen Detective', description: 'Detect common allergens' },
    { id: 'diabetes', name: 'Diabetes-Safe Scanner', description: 'Analyze sugar content and glycemic impact' }
  ];

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Analysis Mode</label>
      <div className="grid grid-cols-3 gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`py-2 px-3 rounded-md text-center transition-colors ${
              currentMode === mode.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <div className="font-medium text-sm">{mode.name}</div>
            <div className="text-xs mt-1 hidden sm:block">
              {currentMode === mode.id 
                ? (mode.id === 'general' ? '✓ Active' : '✓ Enabled')
                : mode.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector; 