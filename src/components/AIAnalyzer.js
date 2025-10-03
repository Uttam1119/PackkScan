import React, { useState } from 'react';

const AIAnalyzer = ({ ingredientText, mode, onAnalysisComplete, onError }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeIngredients = async () => {
    if (!ingredientText || ingredientText.trim() === '') {
      onError('No ingredient text to analyze. Please make sure text is extracted from the image first.');
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      
      if (!apiKey) {
        onError('Gemini API key is missing. Please add your API key to the .env.local file.');
        setIsAnalyzing(false);
        return;
      }
      
      const prompt = buildPrompt(ingredientText, mode);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }
      
      const resultText = data.candidates[0].content.parts[0].text.trim();
      
      const jsonMatch = resultText.match(/```json\n([\s\S]*)\n```/) || 
                        resultText.match(/```\n([\s\S]*)\n```/) || 
                        [null, resultText];
      
      const cleanedJson = jsonMatch[1] || resultText;
      
      try {
        const analysisResults = JSON.parse(cleanedJson);
        onAnalysisComplete(analysisResults);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw response:', resultText);
        onError('Failed to parse AI response. The API did not return valid JSON. Please try again.');
      }
    } catch (error) {
      console.error('AI Analysis Error:', error);
      onError(`Failed to analyze ingredients: ${error.message}. Please check your API key and try again.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const buildPrompt = (text, mode) => {
    let prompt = `You are an expert in food safety and nutrition. I'm going to give you the text extracted from a food label. Your job is to analyze the ingredients and provide a detailed health assessment.

Here is the extracted text from the food label:
"${text}"

First, identify which parts of the text are actual ingredients. Then analyze only those ingredients and provide:

1. A health score from 0 to 100, where 0 is extremely unhealthy and 100 is perfectly healthy.
2. Categorize the product as: "Safe for Daily" consumption, "Occasionally OK", or "Avoid".
3. Estimate the percentage of artificial sweeteners and preservatives.
4. List any harmful additives or concerning ingredients.
5. For each concerning ingredient, provide its confidence of detection (0-100%), risk level (1-10), and potential health effects.
6. Identify any risky ingredient combinations and their potential health impacts.

Return your analysis in this exact JSON format:
{
  "health_score": 75,
  "eatability": "Occasionally OK",
  "breakdown": {
    "sweeteners": "12%",
    "preservatives": "8%",
    "flagged": ["Red 40", "MSG"]
  },
  "confidence_analysis": [
    { "ingredient": "MSG", "confidence": 94, "risk_level": 7, "condition": "headache" }
  ],
  "interactions": [
    { "combo": "Sodium + Sodium Benzoate", "risk_increase": "40%", "concern": "hypertension" }
  ]
}`;

    if (mode === 'allergen') {
      prompt += `

Additional Requirements for Allergen Detection:
1. Identify ALL allergens present in the ingredients list.
2. Check for common allergens: milk, eggs, peanuts, tree nuts, wheat, soy, fish, shellfish.
3. Look for "Contains:" statements and "May contain" warnings.
4. Include these fields in your JSON response:
"allergens": ["milk", "wheat", "soy"], // List all allergens found (use lowercase)
"cross_contamination": true, // true if there are "may contain" warnings
"allergen_warnings": ["May contain tree nuts"] // List any allergen warnings`;
    }

    if (mode === 'diabetes') {
      prompt += `

Also include these fields in your JSON response:
"sugar_content": "High", // Low/Medium/High
"glycemic_risk": "High", // Low/Medium/High
"reason": "Contains dextrose, corn syrup" // Brief explanation`;
    }

    prompt += `\n\nIMPORTANT: 
1. First identify what parts of the text are actual ingredients.
2. Base your analysis ONLY on the ingredients you identified, not on any other text that might have been incorrectly extracted.
3. Be accurate and realistic in your assessment.
4. Return ONLY valid JSON with no additional text or explanation.`;
    
    return prompt;
  };

  return (
    <div className="w-full">
      {isAnalyzing ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Analyzing ingredients...</span>
        </div>
      ) : (
        <button
          onClick={analyzeIngredients}
          className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          disabled={!ingredientText || ingredientText.trim() === ''}
        >
          Analyze Ingredients
        </button>
      )}
    </div>
  );
};

export default AIAnalyzer; 