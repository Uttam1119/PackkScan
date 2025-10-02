class GoogleVisionService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_VISION_API_KEY;
    this.apiUrl = 'https://vision.googleapis.com/v1/images:annotate';
    this.isEnabled = !!this.apiKey;
  }

  isAvailable() {
    return this.isEnabled;
  }

  async performOCR(imageData) {
    if (!this.isAvailable()) {
      throw new Error('Google Vision API is not configured');
    }

    try {
      const base64Image = imageData.includes('base64,') 
        ? imageData.split('base64,')[1] 
        : imageData;

      const requestBody = {
        requests: [
          {
            image: {
              content: base64Image
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              },
              {
                type: 'LABEL_DETECTION',
                maxResults: 10
              },
              {
                type: 'LOGO_DETECTION',
                maxResults: 5
              }
            ]
          }
        ]
      };

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.responses && data.responses[0]) {
        const result = data.responses[0];
        
        return {
          text: result.fullTextAnnotation?.text || '',
          textAnnotations: result.textAnnotations || [],
          labels: result.labelAnnotations || [],
          logos: result.logoAnnotations || [],
          confidence: this.calculateConfidence(result),
          rawResponse: result
        };
      }

      return {
        text: '',
        textAnnotations: [],
        labels: [],
        logos: [],
        confidence: 0,
        error: 'No response from Google Vision API'
      };
    } catch (error) {
      throw error;
    }
  }

  analyzeLabels(labels) {
    const productKeywords = {
      beverage: ['drink', 'beverage', 'soda', 'cola', 'juice', 'water', 'coffee', 'tea'],
      snack: ['snack', 'chips', 'crackers', 'popcorn', 'nuts'],
      candy: ['candy', 'chocolate', 'sweet', 'confectionery', 'dessert'],
      food: ['food', 'meal', 'cuisine', 'dish', 'ingredient']
    };

    const detectedTypes = [];
    
    labels.forEach(label => {
      const description = label.description.toLowerCase();
      
      for (const [type, keywords] of Object.entries(productKeywords)) {
        if (keywords.some(keyword => description.includes(keyword))) {
          detectedTypes.push({
            type,
            confidence: label.score * 100,
            label: label.description
          });
        }
      }
    });

    return detectedTypes;
  }

  extractBrands(logos) {
    return logos.map(logo => ({
      name: logo.description,
      confidence: logo.score * 100,
      boundingBox: logo.boundingPoly
    }));
  }

  calculateConfidence(result) {
    let confidence = 0;
    let factors = 0;

    if (result.fullTextAnnotation) {
      confidence += 80;
      factors++;
    }

    if (result.labelAnnotations && result.labelAnnotations.length > 0) {
      const avgLabelScore = result.labelAnnotations.reduce((sum, label) => sum + label.score, 0) / result.labelAnnotations.length;
      confidence += avgLabelScore * 100;
      factors++;
    }

    if (result.logoAnnotations && result.logoAnnotations.length > 0) {
      confidence += 90;
      factors++;
    }

    return factors > 0 ? Math.round(confidence / factors) : 0;
  }

  processIngredientsText(text) {
    if (!text) return '';

    const ingredientsMatch = text.match(/ingredients[:\s]*([\s\S]*?)(?:nutrition|allergen|manufactured|$)/i);
    
    if (ingredientsMatch && ingredientsMatch[1]) {
      let ingredients = ingredientsMatch[1]
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/[()]/g, match => ` ${match} `)
        .trim();
      
      return `INGREDIENTS: ${ingredients}`;
    }

    return text;
  }

  /**
   * Main analysis function using Google Vision
   */
  async analyzeWithGoogleVision(imageData) {
    try {
      const visionResult = await this.performOCR(imageData);
      
      const productTypes = this.analyzeLabels(visionResult.labels);
      const brands = this.extractBrands(visionResult.logos);
      const processedText = this.processIngredientsText(visionResult.text);
      
      return {
        success: true,
        provider: 'Google Vision API',
        text: processedText,
        rawText: visionResult.text,
        confidence: visionResult.confidence,
        productTypes,
        brands,
        labels: visionResult.labels.map(l => ({
          name: l.description,
          confidence: Math.round(l.score * 100)
        })),
        hasText: visionResult.text.length > 10,
        isProbablyFood: this.checkIfFoodProduct(visionResult)
      };
    } catch (error) {
      return {
        success: false,
        provider: 'Google Vision API',
        error: error.message,
        text: '',
        confidence: 0
      };
    }
  }

  /**
   * Check if detected labels indicate a food product
   */
  checkIfFoodProduct(visionResult) {
    const foodLabels = ['food', 'snack', 'beverage', 'drink', 'ingredient', 'nutrition', 'packaged goods'];
    
    if (visionResult.labels) {
      return visionResult.labels.some(label => 
        foodLabels.some(foodLabel => 
          label.description.toLowerCase().includes(foodLabel)
        )
      );
    }
    
    return false;
  }
}

export default new GoogleVisionService();