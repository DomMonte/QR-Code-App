import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Camera as CameraIcon } from 'lucide-react';
import { supabase, getPublicUrl } from '../lib/supabase';
import PhotoGallery from '../components/PhotoGallery';
import Camera from '../components/Camera';

interface Album {
  id: string;
  name: string;
}

export default function Album() {
  const { albumId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAlbum();
    loadPhotos();
  }, [albumId]);

  const loadAlbum = async () => {
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('id', albumId)
      .single();

    if (!error && data) {
      setAlbum(data);
    }
  };

  const loadPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('album_id', albumId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const photosWithUrls = data.map(photo => ({
        ...photo,
        url: getPublicUrl(photo.path)
      }));
      setPhotos(photosWithUrls);
    }
  };

  const handleCapture = async (file: File) => {
    setUploading(true);
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `${albumId}/${fileName}`;

      // First, upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Then, create the database record
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{
          album_id: albumId,
          path: filePath,
          created_at: new Date().toISOString()
        }]);

      if (dbError) {
        // If database insert fails, clean up the uploaded file
        await supabase.storage.from('photos').remove([filePath]);
        throw dbError;
      }

      // Reload photos after successful upload
      await loadPhotos();
      setShowCamera(false);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {album?.name || 'Loading...'}
            </h1>
            <button
              onClick={() => setShowCamera(true)}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CameraIcon className="w-5 h-5 mr-2" />
              {uploading ? 'Uploading...' : 'Add Photo'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <PhotoGallery photos={photos} />
      </main>

      {showCamera && (
        <Camera
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}