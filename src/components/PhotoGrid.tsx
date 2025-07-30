import React, { useState, useEffect } from 'react';
import { Image, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface PhotoGridProps {
  jobId: string;
  maxPhotos?: number;
  size?: 'sm' | 'md' | 'lg';
}

interface JobPhoto {
  id: string;
  photo_url: string;
  upload_status: string;
  file_name: string;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ 
  jobId, 
  maxPhotos = 3,
  size = 'sm'
}) => {
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  };

  useEffect(() => {
    fetchPhotos();
  }, [jobId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('job_photos')
        .select('id, photo_url, upload_status, file_name')
        .eq('job_id', jobId)
        .eq('upload_status', 'uploaded')
        .order('created_at', { ascending: false })
        .limit(maxPhotos);

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-1">
        {Array.from({ length: Math.min(maxPhotos, 3) }).map((_, i) => (
          <Skeleton key={i} className={`${sizeClasses[size]} rounded`} />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className={`${sizeClasses[size]} rounded bg-muted flex items-center justify-center`}>
        <Image className={`${iconSizes[size]} text-muted-foreground`} />
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {photos.slice(0, maxPhotos).map((photo, index) => (
        <div key={photo.id} className={`${sizeClasses[size]} rounded overflow-hidden bg-muted relative`}>
          {photo.photo_url ? (
            <img
              src={photo.photo_url}
              alt={photo.file_name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <AlertCircle className={`${iconSizes[size]} text-destructive`} />
            </div>
          )}
          <div className={`hidden w-full h-full flex items-center justify-center absolute inset-0 bg-muted`}>
            <Image className={`${iconSizes[size]} text-muted-foreground`} />
          </div>
        </div>
      ))}
      
      {photos.length > maxPhotos && (
        <div className={`${sizeClasses[size]} rounded bg-muted flex items-center justify-center`}>
          <span className="text-xs font-medium text-muted-foreground">
            +{photos.length - maxPhotos}
          </span>
        </div>
      )}
    </div>
  );
};

export default PhotoGrid;