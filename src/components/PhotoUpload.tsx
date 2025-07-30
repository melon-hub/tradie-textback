import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X, RotateCcw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PhotoUploadProps {
  jobId: string;
  onPhotoUploaded?: (photo: JobPhoto) => void;
  maxPhotos?: number;
}

interface JobPhoto {
  id: string;
  job_id: string;
  photo_url: string;
  storage_path: string;
  file_name: string;
  upload_status: string;
  retry_count: number;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  jobId,
  onPhotoUploaded,
  maxPhotos = 5
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch existing photos
  React.useEffect(() => {
    fetchPhotos();
  }, [jobId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('job_photos')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const generateFileName = (file: File) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    return `${jobId}/${timestamp}-${randomString}.${extension}`;
  };

  const uploadPhoto = async (file: File): Promise<JobPhoto | null> => {
    const fileName = generateFileName(file);
    const filePath = `${fileName}`;

    try {
      // Create database record first
      const { data: photoRecord, error: dbError } = await supabase
        .from('job_photos')
        .insert({
          job_id: jobId,
          storage_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          upload_status: 'pending',
          retry_count: 0,
          photo_url: '' // Will be updated after upload
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('job-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('job-photos')
        .getPublicUrl(filePath);

      // Update database record with success
      const { data: updatedPhoto, error: updateError } = await supabase
        .from('job_photos')
        .update({
          upload_status: 'uploaded',
          photo_url: urlData.publicUrl
        })
        .eq('id', photoRecord.id)
        .select()
        .single();

      if (updateError) throw updateError;

      return updatedPhoto;
    } catch (error) {
      console.error('Upload error:', error);
      
      // Update database record with failure
      try {
        await supabase
          .from('job_photos')
          .update({
            upload_status: 'failed',
            retry_count: 1
          })
          .eq('job_id', jobId)
          .eq('storage_path', filePath);
      } catch (dbError) {
        console.error('Failed to update failed upload:', dbError);
      }

      throw error;
    }
  };

  const retryUpload = async (photo: JobPhoto) => {
    try {
      // Find the original file (this is a limitation - in production you'd need to store the file)
      toast({
        title: "Retry not available",
        description: "Please re-select and upload the photo again",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Retry upload error:', error);
      toast({
        title: "Retry failed",
        description: "Could not retry upload. Please try uploading again.",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check photo limit
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: "Photo limit exceeded",
        description: `Maximum ${maxPhotos} photos allowed per job`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadQueue(files);

    try {
      for (const file of files) {
        // Validate file
        if (file.size > 10 * 1024 * 1024) { // 10MB
          toast({
            title: "File too large",
            description: `${file.name} is too large. Maximum size is 10MB.`,
            variant: "destructive"
          });
          continue;
        }

        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a valid image file.`,
            variant: "destructive"
          });
          continue;
        }

        const uploadedPhoto = await uploadPhoto(file);
        if (uploadedPhoto) {
          setPhotos(prev => [uploadedPhoto, ...prev]);
          onPhotoUploaded?.(uploadedPhoto);
          
          toast({
            title: "Photo uploaded",
            description: `${file.name} uploaded successfully`,
          });
        }
      }
    } catch (error) {
      console.error('Upload process error:', error);
      toast({
        title: "Upload failed",
        description: "Some photos failed to upload. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setUploadQueue([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deletePhoto = async (photoId: string, storagePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('job-photos')
        .remove([storagePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('job_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast({
        title: "Photo deleted",
        description: "Photo removed successfully",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loadingPhotos) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Job Photos</h3>
          <Badge variant="outline">{photos.length}/{maxPhotos}</Badge>
        </div>

        {/* Upload Button */}
        {photos.length < maxPhotos && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Add Photos'}
            </Button>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {photo.upload_status === 'uploaded' && photo.photo_url ? (
                    <img
                      src={photo.photo_url}
                      alt="Job photo"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : photo.upload_status === 'pending' ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-destructive/10">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                {photo.upload_status !== 'uploaded' && (
                  <div className="absolute top-1 left-1">
                    <Badge
                      variant={photo.upload_status === 'pending' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {photo.upload_status}
                    </Badge>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    {photo.upload_status === 'failed' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-6 w-6 p-0"
                        onClick={() => retryUpload(photo)}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0"
                      onClick={() => deletePhoto(photo.id, photo.storage_path)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {photos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No photos uploaded yet</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PhotoUpload;