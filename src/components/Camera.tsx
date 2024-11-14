import React, { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera as CameraIcon, Upload, X } from 'lucide-react';

interface CameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function Camera({ onCapture, onClose }: CameraProps) {
  const webcamRef = useRef<Webcam>(null);
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          onCapture(file);
        });
    }
  }, [onCapture]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setMode('camera')}
              className={`p-2 rounded-lg ${
                mode === 'camera' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <CameraIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setMode('upload')}
              className={`p-2 rounded-lg ${
                mode === 'upload' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Upload className="w-6 h-6" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {mode === 'camera' ? (
          <div className="relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
            />
            <button
              onClick={capture}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              Take Photo
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
              Choose Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}