import Tesseract from 'tesseract.js';
import GoogleVisionService from './GoogleVisionService';

class ImageAnalysisService {
  constructor() {
    this.productDatabase = {
      beverages: {
        'coca-cola': { name: 'Coca-Cola', type: 'Soft Drink', category: 'Beverage' },
        'coke': { name: 'Coca-Cola', type: 'Soft Drink', category: 'Beverage' },
        'pepsi': { name: 'Pepsi', type: 'Soft Drink', category: 'Beverage' },
        'sprite': { name: 'Sprite', type: 'Soft Drink', category: 'Beverage' },
        'fanta': { name: 'Fanta', type: 'Soft Drink', category: 'Beverage' },
        'mountain dew': { name: 'Mountain Dew', type: 'Soft Drink', category: 'Beverage' },
        'red bull': { name: 'Red Bull', type: 'Energy Drink', category: 'Beverage' },
        'monster': { name: 'Monster Energy', type: 'Energy Drink', category: 'Beverage' },
        'gatorade': { name: 'Gatorade', type: 'Sports Drink', category: 'Beverage' },
      },
      snacks: {
        'kit-kat': { name: 'Kit-Kat', type: 'Chocolate Bar', category: 'Candy' },
        'kitkat': { name: 'Kit-Kat', type: 'Chocolate Bar', category: 'Candy' },
        'snickers': { name: 'Snickers', type: 'Chocolate Bar', category: 'Candy' },
        'mars': { name: 'Mars Bar', type: 'Chocolate Bar', category: 'Candy' },
        'twix': { name: 'Twix', type: 'Chocolate Bar', category: 'Candy' },
        'oreo': { name: 'Oreo', type: 'Cookie', category: 'Snack' },
        'doritos': { name: 'Doritos', type: 'Chips', category: 'Snack' },
        'lays': { name: "Lay's", type: 'Chips', category: 'Snack' },
        'pringles': { name: 'Pringles', type: 'Chips', category: 'Snack' },
        'cheetos': { name: 'Cheetos', type: 'Chips', category: 'Snack' },
      },
      foods: {
        'nutella': { name: 'Nutella', type: 'Spread', category: 'Food' },
        'kellogg': { name: "Kellogg's", type: 'Cereal', category: 'Food' },
        'nestle': { name: 'Nestlé', type: 'Various', category: 'Food' },
        'kraft': { name: 'Kraft', type: 'Various', category: 'Food' },
        'heinz': { name: 'Heinz', type: 'Condiment', category: 'Food' },
        'campbell': { name: "Campbell's", type: 'Soup', category: 'Food' },
        'maggi': { name: 'Maggi', type: 'Instant Noodles', category: 'Food' },
        'knorr': { name: 'Knorr', type: 'Soup/Seasoning', category: 'Food' },
        'lipton': { name: 'Lipton', type: 'Tea', category: 'Beverage' },
        'nescafe': { name: 'Nescafé', type: 'Coffee', category: 'Beverage' },
        'cadbury': { name: 'Cadbury', type: 'Chocolate', category: 'Candy' },
        'ferrero': { name: 'Ferrero', type: 'Chocolate', category: 'Candy' },
        'hershey': { name: "Hershey's", type: 'Chocolate', category: 'Candy' },
        'milka': { name: 'Milka', type: 'Chocolate', category: 'Candy' },
        'toblerone': { name: 'Toblerone', type: 'Chocolate', category: 'Candy' },
        'parle': { name: 'Parle', type: 'Biscuit', category: 'Snack' },
        'britannia': { name: 'Britannia', type: 'Biscuit', category: 'Snack' },
        'haldiram': { name: "Haldiram's", type: 'Snacks', category: 'Snack' },
        'mtn dew': { name: 'Mountain Dew', type: 'Soft Drink', category: 'Beverage' },
        'dr pepper': { name: 'Dr Pepper', type: 'Soft Drink', category: 'Beverage' },
        '7up': { name: '7UP', type: 'Soft Drink', category: 'Beverage' },
        'mirinda': { name: 'Mirinda', type: 'Soft Drink', category: 'Beverage' },
      }
    };

    this.foodKeywords = [
      'ingredients', 'nutrition', 'calories', 'protein', 'carbohydrate', 
      'sugar', 'sodium', 'fat', 'vitamin', 'mineral', 'serving', 
      'contains', 'allergen', 'manufactured', 'distributed', 'net wt',
      'best before', 'expiry', 'use by', 'ml', 'oz', 'grams', 'mg'
    ];

    this.nonFoodPatterns = [
      /^[0-9]+$/,
      /^[A-Z]+$/,
      /^(the|and|or|of|in|on|at|to|for)$/i,
    ];
  }

  preprocessImage(imageData, strategy = 'auto') {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let scale = 1;
        const targetWidth = 2000;
        
        if (img.width < 800) {
          scale = 1200 / img.width;
        } else if (img.width > 3000) {
          scale = targetWidth / img.width;
        }
        
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        if (strategy === 'original') {
          resolve(canvas.toDataURL('image/png'));
          return;
        }
        
        if (strategy === 'highContrast' || strategy === 'auto') {
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const contrast = 2.0;
            const adjusted = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
            const threshold = adjusted > 140 ? 255 : 0;
            
            data[i] = threshold;
            data[i + 1] = threshold;
            data[i + 2] = threshold;
          }
        } else if (strategy === 'adaptive') {
          const blockSize = 15;
          const C = 10;
          
          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const idx = (y * canvas.width + x) * 4;
              const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
              
              let sum = 0;
              let count = 0;
              
              for (let dy = -blockSize; dy <= blockSize; dy++) {
                for (let dx = -blockSize; dx <= blockSize; dx++) {
                  const ny = y + dy;
                  const nx = x + dx;
                  
                  if (ny >= 0 && ny < canvas.height && nx >= 0 && nx < canvas.width) {
                    const nidx = (ny * canvas.width + nx) * 4;
                    sum += data[nidx] * 0.299 + data[nidx + 1] * 0.587 + data[nidx + 2] * 0.114;
                    count++;
                  }
                }
              }
              
              const mean = sum / count;
              const threshold = gray > (mean - C) ? 255 : 0;
              
              data[idx] = threshold;
              data[idx + 1] = threshold;
              data[idx + 2] = threshold;
            }
          }
        } else if (strategy === 'grayscale') {
          for (let i = 0; i < data.length; i += 4) {
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const contrast = 1.5;
            let adjusted = ((gray / 255 - 0.5) * contrast + 0.5) * 255;
            adjusted = Math.max(0, Math.min(255, adjusted));
            
            data[i] = adjusted;
            data[i + 1] = adjusted;
            data[i + 2] = adjusted;
          }
        } else if (strategy === 'invert') {
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = imageData;
    });
  }

  async performOCR(imageData, options = {}) {
    try {
      const strategies = ['grayscale', 'highContrast', 'original'];
      let bestResult = null;
      let bestConfidence = 0;
      
      for (const strategy of strategies) {
        try {
          // Preprocess image with current strategy
          const processedImage = options.preprocess !== false 
            ? await this.preprocessImage(imageData, strategy) 
            : imageData;

          // Try different page segmentation modes
          const psmModes = strategy === 'original' ? ['3', '6', '11'] : ['3'];
          let strategyBestResult = null;
          let strategyBestConfidence = 0;
          
          for (const psm of psmModes) {
            const result = await Tesseract.recognize(
              processedImage,
              'eng',
              {
                tessedit_pageseg_mode: psm,
                preserve_interword_spaces: '1',
                tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,;:-()[]{}/%&@#$+=*\'"`!? \n\r',
              }
            );
            
            const text = result.data.text || '';
            const confidence = result.data.confidence || 0;
            
            if (confidence > strategyBestConfidence && text.trim().length > 10) {
              strategyBestConfidence = confidence;
              strategyBestResult = result;
            }
          }
          
          if (!strategyBestResult) continue;
          const result = strategyBestResult;

          const confidence = result.data.confidence;
          const text = result.data.text || '';
          const words = result.data.words || [];
          
          // Calculate text quality score
          const textQuality = this.assessTextQuality(text);
          const effectiveConfidence = (confidence * 0.7) + (textQuality * 0.3);
          
          // Keep best result
          if (effectiveConfidence > bestConfidence && text.trim().length > 10) {
            bestConfidence = effectiveConfidence;
            bestResult = {
              text: text,
              confidence: confidence,
              effectiveConfidence: effectiveConfidence,
              words: words.filter(w => w.confidence > 50).map(w => w.text),
              lines: result.data.lines || [],
              strategy: strategy,
              rawData: result.data
            };
          }
        } catch (strategyError) {
          // Continue with next strategy
        }
      }
      
      // If we have a result, return it
      if (bestResult) {
        // Try to enhance the text further
        const enhancedText = this.enhanceExtractedText(bestResult.text);
        
        return {
          text: enhancedText,
          rawText: bestResult.text,
          confidence: bestResult.confidence,
          words: bestResult.words,
          lines: bestResult.lines,
          isProbablyFood: this.checkIfFoodLabel(enhancedText),
          detectedBrands: this.detectBrands(enhancedText),
          hasText: enhancedText.trim().length > 10,
          strategy: bestResult.strategy,
          rawData: bestResult.rawData
        };
      }
      
      // No good result from any strategy
      return {
        text: '',
        confidence: 0,
        words: [],
        lines: [],
        isProbablyFood: false,
        detectedBrands: [],
        hasText: false,
        error: 'Could not extract text with sufficient confidence'
      };
    } catch (error) {
      return {
        text: '',
        confidence: 0,
        words: [],
        lines: [],
        isProbablyFood: false,
        detectedBrands: [],
        hasText: false,
        error: error.message
      };
    }
  }

  /**
   * Assess the quality of extracted text
   */
  assessTextQuality(text) {
    if (!text) return 0;
    
    let score = 0;
    const lowerText = text.toLowerCase();
    
    // Check for common food label patterns
    if (lowerText.includes('ingredients')) score += 20;
    if (lowerText.includes('nutrition')) score += 15;
    if (lowerText.includes('calories')) score += 15;
    if (lowerText.includes('protein')) score += 10;
    if (lowerText.includes('carbohydrate')) score += 10;
    if (lowerText.includes('fat')) score += 10;
    if (lowerText.includes('sodium')) score += 10;
    if (lowerText.includes('sugar')) score += 10;
    
    // Check for reasonable word count
    const wordCount = text.split(/\s+/).filter(w => w.length > 2).length;
    if (wordCount > 10) score += 20;
    if (wordCount > 20) score += 10;
    if (wordCount > 50) score += 10;
    
    // Check for alphanumeric balance
    const hasLetters = /[a-zA-Z]/.test(text);
    const hasNumbers = /[0-9]/.test(text);
    if (hasLetters && hasNumbers) score += 20;
    
    // Penalize for too many special characters
    const specialCharCount = (text.match(/[^a-zA-Z0-9\s.,()%-]/g) || []).length;
    if (specialCharCount / text.length > 0.3) score -= 30;
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Enhance extracted text by fixing common OCR errors
   */
  enhanceExtractedText(text) {
    if (!text) return '';
    
    let enhanced = text;
  
    // Fix common ingredient words that are often misread
    const commonFixes = {
      'ingredlents': 'ingredients',
      'ingred1ents': 'ingredients',
      'nutr1tion': 'nutrition',
      'nutr1t1on': 'nutrition',
      'prote1n': 'protein',
      'sod1um': 'sodium',
      'calc1um': 'calcium',
      'v1tamin': 'vitamin',
      'vitam1n': 'vitamin',
      'calo ries': 'calories',
      'carbo hydrate': 'carbohydrate',
      'mono sodium': 'monosodium',
      'high fructose': 'high fructose',
      'corn syrup': 'corn syrup',
    };
    
    // Apply common fixes
    for (const [wrong, right] of Object.entries(commonFixes)) {
      const regex = new RegExp(wrong, 'gi');
      enhanced = enhanced.replace(regex, right);
    }
    
    // Remove excessive spaces
    enhanced = enhanced.replace(/\s+/g, ' ');
    
    // Fix punctuation spacing
    enhanced = enhanced.replace(/\s*,\s*/g, ', ');
    enhanced = enhanced.replace(/\s*\.\s*/g, '. ');
    enhanced = enhanced.replace(/\s*:\s*/g, ': ');
    
    // Remove random single characters that are likely noise
    enhanced = enhanced.replace(/\b[a-z]\b/gi, (match, offset, string) => {
      // Keep 'a' and 'I' as they are valid words
      if (match.toLowerCase() === 'a' || match === 'I') return match;
      // Check if it's part of a vitamin (e.g., "Vitamin C")
      const before = string.substring(Math.max(0, offset - 10), offset).toLowerCase();
      if (before.includes('vitamin')) return match;
      return '';
    });
    
    // Clean up multiple spaces created by removals
    enhanced = enhanced.replace(/\s+/g, ' ').trim();
    
    return enhanced;
  }

  /**
   * Check if the extracted text is likely from a food label
   */
  checkIfFoodLabel(text) {
    if (!text || text.length < 20) return false;
    
    const lowerText = text.toLowerCase();
    let foodKeywordCount = 0;
    
    for (const keyword of this.foodKeywords) {
      if (lowerText.includes(keyword)) {
        foodKeywordCount++;
      }
    }
    
    // If we find at least 3 food-related keywords, it's probably a food label
    return foodKeywordCount >= 3;
  }

  /**
   * Detect brand names in the extracted text
   */
  detectBrands(text) {
    if (!text) return [];
    
    const lowerText = text.toLowerCase();
    const detectedBrands = [];
    
    // Check all product databases
    const allProducts = {
      ...this.productDatabase.beverages,
      ...this.productDatabase.snacks,
      ...this.productDatabase.foods
    };
    
    for (const [key, product] of Object.entries(allProducts)) {
      if (lowerText.includes(key)) {
        detectedBrands.push(product);
      }
    }
    
    return detectedBrands;
  }

  /**
   * Analyze image for product type using basic computer vision
   */
  async analyzeProductType(imageData) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Analyze color distribution
        let redSum = 0, greenSum = 0, blueSum = 0;
        let brightPixels = 0, darkPixels = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          redSum += data[i];
          greenSum += data[i + 1];
          blueSum += data[i + 2];
          
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 200) brightPixels++;
          if (brightness < 50) darkPixels++;
        }
        
        const pixelCount = data.length / 4;
        const avgRed = redSum / pixelCount;
        const avgGreen = greenSum / pixelCount;
        const avgBlue = blueSum / pixelCount;
        
        // Simple heuristics for product type
        let productType = 'Unknown';
        let confidence = 0;
        
        // Dark packaging often indicates cola/energy drinks
        if (darkPixels > pixelCount * 0.4) {
          productType = 'Beverage (possibly cola or energy drink)';
          confidence = 60;
        }
        // Bright red packaging often indicates snacks or candy
        else if (avgRed > avgGreen * 1.3 && avgRed > avgBlue * 1.3) {
          productType = 'Snack or Candy';
          confidence = 55;
        }
        // Brown tones might indicate chocolate
        else if (Math.abs(avgRed - avgGreen) < 30 && avgBlue < avgRed * 0.8) {
          productType = 'Chocolate or Cookie';
          confidence = 50;
        }
        // Bright/white packaging
        else if (brightPixels > pixelCount * 0.5) {
          productType = 'Packaged Food Item';
          confidence = 45;
        }
        
        resolve({
          productType,
          confidence,
          colorProfile: {
            dominantColor: this.rgbToHex(avgRed, avgGreen, avgBlue),
            avgRed: Math.round(avgRed),
            avgGreen: Math.round(avgGreen),
            avgBlue: Math.round(avgBlue),
            brightness: Math.round((avgRed + avgGreen + avgBlue) / 3)
          }
        });
      };
      img.src = imageData;
    });
  }

  /**
   * Convert RGB to hex color
   */
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1);
  }

  /**
   * Main analysis function combining all capabilities
   */
  async analyzeImage(imageData) {
    // Try Google Vision first if available
    if (GoogleVisionService.isAvailable()) {
      try {
        const googleResult = await GoogleVisionService.analyzeWithGoogleVision(imageData);
        if (googleResult.success) {
          // Combine Google Vision results with our analysis
          const productAnalysis = await this.analyzeProductType(imageData);
          
          return {
            success: true,
            provider: 'Google Vision API',
            ocrResult: {
              text: googleResult.text,
              rawText: googleResult.rawText,
              confidence: googleResult.confidence,
              hasText: googleResult.hasText,
              isProbablyFood: googleResult.isProbablyFood,
              words: []
            },
            productInfo: {
              detectedBrands: googleResult.brands || [],
              productType: googleResult.productTypes?.[0]?.type || productAnalysis.productType,
              typeConfidence: googleResult.productTypes?.[0]?.confidence || productAnalysis.confidence,
              colorProfile: productAnalysis.colorProfile,
              labels: googleResult.labels
            },
            confidence: {
              overall: googleResult.confidence,
              ocr: googleResult.confidence,
              productType: googleResult.productTypes?.[0]?.confidence || 0,
              isReliable: googleResult.confidence > 50
            },
            recommendations: this.generateRecommendations(
              { confidence: googleResult.confidence, hasText: googleResult.hasText, isProbablyFood: googleResult.isProbablyFood, detectedBrands: googleResult.brands },
              googleResult.confidence
            ),
            timestamp: new Date().toISOString()
          };
        }
      } catch (error) {
        // Silently fall back to Tesseract
      }
    }
    
    // Fallback to Tesseract.js
    const [ocrResult, productAnalysis] = await Promise.all([
      this.performOCR(imageData),
      this.analyzeProductType(imageData)
    ]);
    
    // Determine overall confidence
    const overallConfidence = this.calculateOverallConfidence(ocrResult, productAnalysis);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(ocrResult, overallConfidence);
    
    // Use the already enhanced text from OCR result
    const cleanedText = ocrResult.text; // Already enhanced in performOCR
    
    return {
      success: ocrResult.hasText || ocrResult.detectedBrands.length > 0,
      ocrResult: {
        text: cleanedText,
        rawText: ocrResult.text,
        confidence: ocrResult.confidence,
        hasText: ocrResult.hasText,
        isProbablyFood: ocrResult.isProbablyFood,
        words: ocrResult.words
      },
      productInfo: {
        detectedBrands: ocrResult.detectedBrands,
        productType: productAnalysis.productType,
        typeConfidence: productAnalysis.confidence,
        colorProfile: productAnalysis.colorProfile
      },
      confidence: {
        overall: overallConfidence,
        ocr: ocrResult.confidence,
        productType: productAnalysis.confidence,
        isReliable: overallConfidence > 50
      },
      recommendations: recommendations,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate overall confidence score
   */
  calculateOverallConfidence(ocrResult, productAnalysis) {
    let score = 0;
    let factors = 0;
    
    // OCR confidence (weighted heavily)
    if (ocrResult.confidence > 0) {
      score += ocrResult.confidence * 0.5;
      factors += 0.5;
    }
    
    // Text presence
    if (ocrResult.hasText) {
      score += 30 * 0.2;
      factors += 0.2;
    }
    
    // Food label detection
    if (ocrResult.isProbablyFood) {
      score += 80 * 0.2;
      factors += 0.2;
    }
    
    // Brand detection
    if (ocrResult.detectedBrands.length > 0) {
      score += 90 * 0.1;
      factors += 0.1;
    }
    
    // Product type confidence
    if (productAnalysis.confidence > 0) {
      score += productAnalysis.confidence * 0.1;
      factors += 0.1;
    }
    
    return factors > 0 ? Math.round(score / factors) : 0;
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(ocrResult, overallConfidence) {
    const recommendations = [];
    
    if (overallConfidence < 30) {
      recommendations.push({
        type: 'error',
        message: 'Low confidence in image analysis. Please ensure the image is clear and contains a food label.'
      });
    }
    
    if (!ocrResult.hasText) {
      recommendations.push({
        type: 'warning',
        message: 'No text detected. Try taking a clearer photo with better lighting.'
      });
    }
    
    if (ocrResult.hasText && !ocrResult.isProbablyFood) {
      recommendations.push({
        type: 'info',
        message: 'This might not be a food label. Please verify the extracted text.'
      });
    }
    
    if (ocrResult.confidence > 0 && ocrResult.confidence < 60) {
      recommendations.push({
        type: 'warning',
        message: 'OCR confidence is low. Consider manually verifying or editing the extracted text.'
      });
    }
    
    if (ocrResult.detectedBrands.length > 0) {
      recommendations.push({
        type: 'success',
        message: `Detected product: ${ocrResult.detectedBrands[0].name}`
      });
    }
    
    return recommendations;
  }

  /**
   * Clean extracted text
   */
  cleanExtractedText(text) {
    if (!text) return '';
    
    let cleaned = text;
    
    // First, fix common OCR errors
    cleaned = this.enhanceExtractedText(cleaned);
    
    // Split into lines and process
    let lines = cleaned.split(/[\n\r]+/);
    
    // Filter out noise lines
    lines = lines.filter(line => {
      const trimmed = line.trim();
      // Keep lines with at least 3 characters
      if (trimmed.length < 3) return false;
      // Keep lines with at least one letter
      if (!/[a-zA-Z]/.test(trimmed)) return false;
      // Remove lines that are just numbers or symbols
      if (/^[^a-zA-Z]+$/.test(trimmed)) return false;
      return true;
    });
    
    cleaned = lines.join(' ');
    
    // Try to identify and extract key sections
    const sections = this.extractFoodLabelSections(cleaned);
    if (sections.ingredients || sections.nutrition) {
      cleaned = this.formatExtractedSections(sections);
    }
    
    // Final cleanup
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  /**
   * Extract key sections from food label text
   */
  extractFoodLabelSections(text) {
    const sections = {};
    
    // Try to find ingredients section
    const ingredientsPatterns = [
      /ingredients?[:\s]*([^.]*(?:contains|may contain|allergen|nutrition|manufactured|distributed|$))/i,
      /ingredients?[:\s]*([\s\S]*?)(?:nutrition|allergen|manufactured|distributed|$)/i,
      /contains[:\s]*([^.]*(?:may contain|allergen|nutrition|$))/i
    ];
    
    for (const pattern of ingredientsPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        sections.ingredients = match[1].trim();
        break;
      }
    }
    
    // Try to find nutrition section
    const nutritionPatterns = [
      /nutrition\s*facts?[:\s]*([\s\S]*?)(?:ingredients|allergen|manufactured|$)/i,
      /calories[:\s]*(\d+[\s\S]*?)(?:ingredients|allergen|$)/i
    ];
    
    for (const pattern of nutritionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        sections.nutrition = match[1].trim();
        break;
      }
    }
    
    // Extract product name if possible
    const firstLine = text.split(/[\n\r]/)[0];
    if (firstLine && firstLine.length < 50 && /^[A-Z]/.test(firstLine)) {
      sections.productName = firstLine.trim();
    }
    
    return sections;
  }

  /**
   * Format extracted sections into clean text
   */
  formatExtractedSections(sections) {
    let formatted = [];
    
    if (sections.productName) {
      formatted.push(`Product: ${sections.productName}`);
    }
    
    if (sections.ingredients) {
      // Clean up ingredients list
      let ingredients = sections.ingredients;
      ingredients = ingredients.replace(/\s+/g, ' ');
      ingredients = ingredients.replace(/[()]/g, match => ` ${match} `);
      ingredients = ingredients.replace(/\s+/g, ' ').trim();
      formatted.push(`Ingredients: ${ingredients}`);
    }
    
    if (sections.nutrition) {
      formatted.push(`Nutrition: ${sections.nutrition}`);
    }
    
    return formatted.join('\n\n');
  }

  /**
   * Format ingredients list for better readability
   */
  formatIngredientsList(text) {
    const lines = text.split('\n');
    let inIngredients = false;
    let formatted = [];
    
    for (let line of lines) {
      if (line.toLowerCase().includes('ingredients')) {
        inIngredients = true;
        formatted.push(line);
      } else if (inIngredients && line.toLowerCase().includes('nutrition')) {
        inIngredients = false;
        formatted.push('\n' + line);
      } else if (inIngredients) {
        // Clean up ingredients line
        const cleaned = line.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
        if (cleaned.length > 0) {
          formatted.push(cleaned);
        }
      } else {
        formatted.push(line);
      }
    }
    
    return formatted.join('\n');
  }
}

export default new ImageAnalysisService();