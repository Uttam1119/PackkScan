import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, PencilIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TextEditor = ({ initialText, onTextUpdate, showFallback = false, analysisResult = null }) => {
  const [text, setText] = useState(initialText || '');
  const [isEditing, setIsEditing] = useState(false);
  const [inputMethod, setInputMethod] = useState('extracted'); // 'extracted', 'manual', 'search'

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSave = () => {
    onTextUpdate(text);
    setIsEditing(false);
  };

  // Common product templates for manual input
  const productTemplates = {
    'soft-drink': 'Carbonated water, High fructose corn syrup, Caramel color, Phosphoric acid, Natural flavors, Caffeine',
    'chips': 'Potatoes, Vegetable oil (sunflower, corn, and/or canola oil), Salt',
    'chocolate': 'Sugar, Cocoa butter, Milk, Chocolate, Lactose, Soy lecithin, Natural flavor',
    'cookie': 'Enriched flour (wheat flour, niacin, reduced iron, thiamine mononitrate, riboflavin, folic acid), Sugar, Palm oil, Cocoa, High fructose corn syrup, Salt, Baking soda',
    'energy-drink': 'Carbonated water, Sugar, Glucose syrup, Citric acid, Taurine, Natural and artificial flavors, Caffeine, Colors, Niacinamide, Vitamin B6, Vitamin B12'
  };

  const handleTemplateSelect = (template) => {
    setText(productTemplates[template]);
    onTextUpdate(productTemplates[template]);
  };

  return (
    <div className="w-full border border-gray-300 rounded-lg bg-white mt-4">
      {/* Method Selection Tabs */}
      {showFallback && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setInputMethod('extracted')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center ${
              inputMethod === 'extracted'
                ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Scanned
          </button>
          <button
            onClick={() => setInputMethod('manual')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center ${
              inputMethod === 'manual'
                ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Type
          </button>
          <button
            onClick={() => setInputMethod('search')}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center ${
              inputMethod === 'search'
                ? 'border-b-2 border-indigo-500 text-indigo-600 bg-indigo-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
            Common Foods
          </button>
        </div>
      )}

      <div className="flex justify-between items-center px-4 py-2 border-b border-gray-300 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">
          {inputMethod === 'manual' ? 'Type the ingredients' :
           inputMethod === 'search' ? 'Choose a product type' :
           'Review ingredients'}
        </h3>
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Save
            </button>
            <button
              onClick={() => {
                setText(initialText || '');
                setIsEditing(false);
              }}
              className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Edit
          </button>
        )}
      </div>
      
      {/* Content based on input method */}
      {inputMethod === 'search' ? (
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">Quick select a product type:</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => handleTemplateSelect('soft-drink')}
              className="p-4 bg-white border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg transition-all text-center"
            >
              <div className="text-2xl mb-1">🥤</div>
              <div className="text-sm font-medium text-gray-700">Soft Drink</div>
            </button>
            <button
              onClick={() => handleTemplateSelect('chips')}
              className="p-4 bg-white border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg transition-all text-center"
            >
              <div className="text-2xl mb-1">🍟</div>
              <div className="text-sm font-medium text-gray-700">Chips</div>
            </button>
            <button
              onClick={() => handleTemplateSelect('chocolate')}
              className="p-4 bg-white border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg transition-all text-center"
            >
              <div className="text-2xl mb-1">🍫</div>
              <div className="text-sm font-medium text-gray-700">Chocolate</div>
            </button>
            <button
              onClick={() => handleTemplateSelect('cookie')}
              className="p-4 bg-white border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 rounded-lg transition-all text-center"
            >
              <div className="text-2xl mb-1">🍪</div>
              <div className="text-sm font-medium text-gray-700">Cookie</div>
            </button>
          </div>
          {text && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Ingredients:</p>
              <p className="text-sm text-gray-600">{text}</p>
            </div>
          )}
        </div>
      ) : inputMethod === 'manual' ? (
        <div className="p-4">
          <textarea
            value={text}
            onChange={handleTextChange}
            className="w-full p-3 h-32 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type the ingredients from your food label..."
          />
          <button
            onClick={() => onTextUpdate(text)}
            className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full font-medium"
          >
            Continue with these ingredients
          </button>
        </div>
      ) : (
        // Original extracted text view
        isEditing ? (
          <textarea
            value={text}
            onChange={handleTextChange}
            className="w-full p-4 h-48 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-b-lg"
            placeholder="Edit the extracted ingredients text here..."
          />
        ) : (
          <div className="p-4 h-48 overflow-y-auto">
            {text ? (
              <div className="whitespace-pre-wrap text-gray-700">{text}</div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 italic mb-4">No text extracted yet.</p>
                {showFallback && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setInputMethod('manual')}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Enter ingredients manually →
                    </button>
                    <br />
                    <button
                      onClick={() => setInputMethod('search')}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Search for product type →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default TextEditor; 