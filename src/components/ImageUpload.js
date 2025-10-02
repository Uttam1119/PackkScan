import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { CameraIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const ImageUpload = ({ onImageCaptured }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageCaptured(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onImageCaptured(imageSrc);
      setShowCamera(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {showCamera ? (
        <div className="relative">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full rounded-lg shadow-lg"
          />
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleCameraCapture}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
              disabled={isCapturing}
            >
              <CameraIcon className="h-5 w-5 mr-2" />
              {isCapturing ? 'Capturing...' : 'Capture Photo'}
            </button>
            <button
              onClick={() => setShowCamera(false)}
              className="ml-4 bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 w-full flex flex-col items-center justify-center">
            <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 mb-3" />
            <p className="text-gray-600 mb-4">Upload a food label image</p>
            <div className="flex space-x-4">
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Upload File
              </button>
              <button
                onClick={() => setShowCamera(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                Use Camera
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 