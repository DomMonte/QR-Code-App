import React, { useState, useEffect, TouchEvent } from 'react';
import { Image, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  created_at: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reset selected index when photo changes
  useEffect(() => {
    if (selectedPhoto) {
      const index = photos.findIndex(photo => photo.id === selectedPhoto.id);
      setSelectedIndex(index);
    }
  }, [selectedPhoto, photos]);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `photo-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      setSelectedPhoto(photos[selectedIndex - 1]);
    }
  };

  const handleNext = () => {
    if (selectedIndex < photos.length - 1) {
      setSelectedPhoto(photos[selectedIndex + 1]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setSelectedPhoto(null);
  };

  useEffect(() => {
    if (selectedPhoto) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPhoto, selectedIndex]);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Image className="w-16 h-16 mb-4" />
        <p className="text-lg">No photos yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 p-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="break-inside-avoid rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.url}
              alt={`Photo ${photo.id}`}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Navigation buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="fixed left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            style={{ display: selectedIndex === 0 ? 'none' : 'block' }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="fixed right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            style={{ display: selectedIndex === photos.length - 1 ? 'none' : 'block' }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Controls */}
          <div className="fixed top-4 right-4 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(selectedPhoto.url);
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="Download photo"
            >
              <Download className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Main image */}
          <div 
            className="relative max-w-7xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={selectedPhoto.url}
              alt={`Photo ${selectedPhoto.id}`}
              className="max-h-[90vh] w-auto object-contain select-none"
            />
          </div>
        </div>
      )}
    </>
  );
}