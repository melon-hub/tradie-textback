import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, X, ImageIcon } from 'lucide-react';

interface IntakePhotoUploadProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
}

const IntakePhotoUpload: React.FC<IntakePhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5
}) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Update previews when photos change
  React.useEffect(() => {
    const newPreviews = photos.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);

    // Cleanup previous object URLs
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, isCamera = false) => {
    console.log(`File select triggered - isCamera: ${isCamera}`);
    const files = Array.from(event.target.files || []);
    console.log(`Files selected: ${files.length}`);
    if (files.length === 0) return;

    // Check photo limit
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: "Photo limit exceeded",
        description: `Maximum ${maxPhotos} photos allowed`,
        variant: "destructive"
      });
      return;
    }

    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 10MB.`,
          variant: "destructive"
        });
        return false;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file.`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      const updatedPhotos = [...photos, ...validFiles];
      onPhotosChange(updatedPhotos);
      
      toast({
        title: "Photos added",
        description: `${validFiles.length} photo${validFiles.length > 1 ? 's' : ''} added successfully`,
      });
    }

    // Reset input values
    if (event.target) {
      event.target.value = '';
    }
  };

  const takePhoto = () => {
    console.log('Take photo button clicked');
    
    // Check for camera permissions and trigger camera input
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('Camera API available, opening camera input');
      cameraInputRef.current?.click();
    } else {
      console.error('Camera API not available');
      toast({
        title: "Camera not available",
        description: "Camera access is not supported on this device",
        variant: "destructive"
      });
    }
  };

  const selectFromGallery = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
    
    toast({
      title: "Photo removed",
      description: "Photo removed successfully"
    });
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e, false)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment" // This enables direct camera access on mobile
        onChange={(e) => handleFileSelect(e, true)}
        className="hidden"
      />

      {/* Upload Area */}
      <div className="text-center space-y-4">
        <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-6 lg:p-8 touch-manipulation">
          <Camera className="h-8 lg:h-12 w-8 lg:w-12 mx-auto text-muted-foreground mb-3 lg:mb-4" />
          <p className="text-muted-foreground mb-3 lg:mb-4 text-sm lg:text-base">
            Add photos to help the tradie quote accurately
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3 justify-center">
            <Button 
              onClick={takePhoto}
              variant="default"
              className="w-full h-12 text-base font-medium"
              disabled={photos.length >= maxPhotos}
            >
              <Camera className="h-5 w-5 mr-2" />
              Take Photo
            </Button>
            <Button 
              onClick={selectFromGallery}
              variant="outline"
              className="w-full h-12 text-base font-medium"
              disabled={photos.length >= maxPhotos}
            >
              <Upload className="h-5 w-5 mr-2" />
              Choose from Gallery
            </Button>
          </div>
          
          {photos.length >= maxPhotos && (
            <p className="text-xs text-muted-foreground mt-2">
              Maximum {maxPhotos} photos reached
            </p>
          )}
        </div>
      </div>

      {/* Photo Previews */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Photos ({photos.length}/{maxPhotos})</h4>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {previews[index] ? (
                    <img
                      src={previews[index]}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                
                {/* File name */}
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {photo.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground text-center">
        Photos help tradies give you a better quote faster. 
        {photos.length === 0 && " Optional but recommended."}
      </p>
    </div>
  );
};

export default IntakePhotoUpload;