import React, { useState, useEffect } from 'react';
import { useFoodHistory } from '../contexts/FoodHistoryContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const ResultsDisplay = ({ results, mode, extractedText, capturedImage }) => {
  const { addFoodItem, markAsEaten } = useFoodHistory();
  const { preferences, checkForAllergens } = useUserPreferences();
  const [foodItemId, setFoodItemId] = useState(null);
  const [foodData, setFoodData] = useState(null);
  const [isEaten, setIsEaten] = useState(null);
  const [foundAllergens, setFoundAllergens] = useState([]);
  const [showAllergenAlert, setShowAllergenAlert] = useState(false);

  useEffect(() => {
    if (results && extractedText) {
      // Check for allergens
      const detectedAllergens = checkForAllergens(extractedText);
      setFoundAllergens(detectedAllergens);
      setShowAllergenAlert(detectedAllergens.length > 0 && preferences.notificationSettings.allergenAlerts);
      
      // Determine product name intelligently
      let productName = results.productName || '';
      
      // Try to get name from detected brands first
      if (!productName && results.breakdown?.detectedBrands?.length > 0) {
        productName = results.breakdown.detectedBrands[0].name;
      }
      
      // If no brand, use product type
      if (!productName && results.productType) {
        productName = results.productType;
      }
      
      // Fallback to category-based naming
      if (!productName) {
        if (mode === 'diabetes') {
          productName = 'Food Product (Diabetes Check)';
        } else if (mode === 'allergen') {
          productName = 'Food Product (Allergen Check)';
        } else if (results.breakdown?.flagged?.some(item => 
          item.toLowerCase().includes('chocolate') || 
          item.toLowerCase().includes('cocoa'))) {
          productName = 'Chocolate Product';
        } else if (results.breakdown?.flagged?.some(item => 
          item.toLowerCase().includes('chips') || 
          item.toLowerCase().includes('potato'))) {
          productName = 'Chips/Snack';
        } else if (extractedText?.toLowerCase().includes('beverage') || 
                   extractedText?.toLowerCase().includes('drink')) {
          productName = 'Beverage';
        } else {
          productName = 'Food Product';
        }
      }
      
      // Add to food history
      const foodData = {
        name: productName,
        ingredients: extractedText,
        healthScore: results.health_score,
        eatability: results.eatability,
        analysisResults: results,
        mode: mode,
        image: capturedImage || null,
        productType: results.productType,
        detectedBrands: results.breakdown?.detectedBrands || []
      };
      setFoodData(foodData); // Store food data for display
      const item = addFoodItem(foodData);
      if (item) {
        setFoodItemId(item.id);
      }
    }
  }, [results, extractedText, capturedImage]);

  const handleMarkAsEaten = (eaten) => {
    if (foodItemId) {
      markAsEaten(foodItemId, eaten);
      setIsEaten(eaten);
    }
  };

  if (!results) return null;

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEatabilityBadge = (eatability) => {
    switch (eatability) {
      case 'Safe for Daily':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Safe for Daily</span>;
      case 'Occasionally OK':
        return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Occasionally OK</span>;
      case 'Avoid':
        return <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">Avoid</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      {/* Allergen Alert */}
      {showAllergenAlert && foundAllergens.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Allergen Alert!</h3>
              <p className="text-red-700 mb-3">
                This product contains allergens from your profile:
              </p>
              <div className="flex flex-wrap gap-2">
                {foundAllergens.map(allergen => (
                  <span
                    key={allergen}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-bold"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Detected Product</p>
            <h3 className="text-xl font-bold text-gray-800">
              {foodItemId && foodData ? foodData.name : 'Analyzing...'}
            </h3>
            {results.productType && (
              <p className="text-sm text-gray-600 mt-1">
                Category: {results.productType}
              </p>
            )}
          </div>
          {results.health_score && (
            <div className="text-center">
              <div className={`text-3xl font-bold ${getHealthScoreColor(results.health_score)}`}>
                {results.health_score}
              </div>
              <p className="text-xs text-gray-500">Health Score</p>
            </div>
          )}
        </div>
      </div>

      {/* Eaten/Not Eaten Buttons */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Did you eat this?</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleMarkAsEaten(true)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
              isEaten === true
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-green-50 border border-gray-200'
            }`}
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Yes, I ate it
          </button>
          <button
            onClick={() => handleMarkAsEaten(false)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
              isEaten === false
                ? 'bg-gray-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <XCircleIcon className="h-5 w-5 mr-2" />
            No, I didn't
          </button>
        </div>
        
        {/* Show status and action button only after selection */}
        {isEaten !== null && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 text-center mb-3">
              {isEaten 
                ? '✅ Added to your food journal' 
                : 'ℹ️ Saved for reference'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              📷 Scan Another Label
            </button>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Nutritional Analysis</h2>
        {mode !== 'general' && (
          <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
            {mode === 'allergen' ? 'Allergen Detective' : 'Diabetes-Safe Scanner'}
          </div>
        )}
      </div>

      {/* Health Score Meter */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Health Score</span>
          <span className="text-sm font-medium text-gray-700">{results.health_score}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`${getHealthScoreColor(results.health_score)} h-4 rounded-full`} 
            style={{ width: `${results.health_score}%` }}
          ></div>
        </div>
        <div className="mt-2 flex justify-center">
          {getEatabilityBadge(results.eatability)}
        </div>
      </div>

      {/* Ingredient Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredient Breakdown</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Sweeteners</p>
            <p className="text-xl font-bold text-blue-700">{results.breakdown.sweeteners}</p>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Preservatives</p>
            <p className="text-xl font-bold text-purple-700">{results.breakdown.preservatives}</p>
          </div>
        </div>
      </div>

      {/* Flagged Ingredients */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Flagged Ingredients</h3>
        <div className="flex flex-wrap gap-2">
          {results.breakdown.flagged.map((item, index) => (
            <span 
              key={index} 
              className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Mode-specific sections */}
      {mode === 'allergen' && (
        <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-3">🔍 Allergen Detection Results</h3>
          
          {/* Common Allergens Check */}
          <div className="mb-4">
            <p className="text-sm font-medium text-yellow-700 mb-2">Common Allergens Found:</p>
            <div className="flex flex-wrap gap-2">
              {['milk', 'eggs', 'peanuts', 'tree nuts', 'wheat', 'soy', 'fish', 'shellfish'].map(allergen => {
                const found = extractedText?.toLowerCase().includes(allergen) || 
                             results.allergens?.some(a => a.toLowerCase().includes(allergen));
                return (
                  <span
                    key={allergen}
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      found
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {found ? '⚠️ ' : '✓ '}{allergen}
                  </span>
                );
              })}
            </div>
          </div>
          
          {/* Detected Allergens List */}
          {results.allergens && results.allergens.length > 0 ? (
            <div className="mb-3">
              <p className="text-sm font-medium text-yellow-700 mb-2">Specific Allergens Detected:</p>
              <div className="flex flex-wrap gap-2">
                {results.allergens.map((allergen, index) => (
                  <span 
                    key={index} 
                    className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          
          {/* Cross Contamination Warning */}
          {(extractedText?.toLowerCase().includes('may contain') || 
            extractedText?.toLowerCase().includes('processed in a facility') ||
            extractedText?.toLowerCase().includes('manufactured in')) && (
            <div className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded border border-yellow-300">
              ⚠️ <strong>Cross-Contamination Risk:</strong> This product may contain traces of allergens from shared processing facilities.
            </div>
          )}
          
          {/* Allergen-Free Notice */}
          {!results.allergens?.length && !foundAllergens.length && (
            <div className="text-sm text-green-700 bg-green-100 p-3 rounded border border-green-300">
              ✅ No major allergens detected in this product based on the label scan.
            </div>
          )}
        </div>
      )}

      {mode === 'diabetes' && results.sugar_content && (
        <div className="mb-6 bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800 mb-3">Diabetes Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Sugar Content</p>
              <p className={`text-xl font-bold ${results.sugar_content === 'High' ? 'text-red-600' : 'text-orange-600'}`}>
                {results.sugar_content}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Glycemic Risk</p>
              <p className={`text-xl font-bold ${results.glycemic_risk === 'High' ? 'text-red-600' : 'text-orange-600'}`}>
                {results.glycemic_risk}
              </p>
            </div>
          </div>
          {results.reason && (
            <p className="mt-2 text-sm text-orange-700">{results.reason}</p>
          )}
        </div>
      )}

      {/* Confidence Analysis */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Detailed Risk Analysis</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.confidence_analysis.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.ingredient}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.confidence}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.risk_level}/10</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.condition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactions */}
      {results.interactions && results.interactions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Ingredient Interactions</h3>
          <div className="bg-red-50 p-4 rounded-lg">
            {results.interactions.map((interaction, index) => (
              <div key={index} className="mb-2 last:mb-0">
                <p className="text-sm">
                  <span className="font-medium text-red-700">{interaction.combo}</span>
                  <span className="mx-2">→</span>
                  <span className="text-red-600">Increases {interaction.concern} risk by {interaction.risk_increase}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay; 