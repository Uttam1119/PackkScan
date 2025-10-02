import React, { useState, useEffect } from 'react';
import ImageAnalysisService from '../services/ImageAnalysisService';

const OcrProcessor = ({ imageData, onTextExtracted, onError, onAnalysisComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const processImage = async () => {
    if (!imageData) return;
    
    try {
      setIsProcessing(true);
      setProgress(10);
      
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      const analysis = await ImageAnalysisService.analyzeImage(imageData);
      
      clearInterval(progressInterval);
      setProgress(100);
      setAnalysisResult(analysis);
      
      if (analysis.confidence.isReliable && analysis.ocrResult.text) {
        onTextExtracted(analysis.ocrResult.text);
        if (onAnalysisComplete) {
          onAnalysisComplete(analysis);
        }
      } else if (!analysis.ocrResult.hasText) {
        onError('No text detected in the image. Please ensure the image contains a clear food label.');
        setShowDetails(true);
      } else {
        setShowDetails(true);
      }
      
      setIsProcessing(false);
    } catch (error) {
      onError('Failed to analyze the image. Please try again.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const proceedWithText = () => {
    if (analysisResult && analysisResult.ocrResult.text) {
      onTextExtracted(analysisResult.ocrResult.text);
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'text-green-600';
    if (confidence >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 70) return 'bg-green-100';
    if (confidence >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="w-full">
      {isProcessing ? (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center mt-2 text-gray-600">
            Reading your food label...
          </p>
        </div>
      ) : analysisResult && showDetails ? (
        <div className="mt-4 bg-white rounded-lg shadow-lg p-6">
          {analysisResult.productInfo.detectedBrands.length > 0 ? (
            <div className="mb-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Product Recognized!</h3>
              {analysisResult.productInfo.detectedBrands.map((brand, index) => (
                <div key={index} className="text-xl font-bold text-green-700 mb-1">
                  {brand.name}
                </div>
              ))}
              <p className="text-sm text-gray-600 mt-2">We found the ingredients for this product</p>
            </div>
          ) : analysisResult.ocrResult.hasText ? (
            <div className="mb-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Text Found</h3>
              <p className="text-sm text-gray-600">We extracted text from your image</p>
            </div>
          ) : (
            <div className="mb-4 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Couldn't Read Label</h3>
              <p className="text-sm text-gray-600">The image might be blurry or not a food label</p>
            </div>
          )}

          {analysisResult.ocrResult.text && analysisResult.confidence.overall > 40 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <p className="text-sm text-gray-700 line-clamp-3">
                {analysisResult.ocrResult.text.substring(0, 150)}
                {analysisResult.ocrResult.text.length > 150 && '...'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {analysisResult.ocrResult.hasText ? (
              <>
                <button
                  onClick={proceedWithText}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Continue →
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setAnalysisResult(null);
                    setProgress(0);
                  }}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Retake
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onTextExtracted('');
                    if (onAnalysisComplete) {
                      onAnalysisComplete(analysisResult);
                    }
                  }}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Enter Manually →
                </button>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setAnalysisResult(null);
                    setProgress(0);
                  }}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Try Another Photo
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={processImage}
          className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
        >
          Read Label
        </button>
      )}
    </div>
  );
};

export default OcrProcessor; 