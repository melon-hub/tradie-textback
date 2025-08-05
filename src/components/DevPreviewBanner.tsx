import { useDevPreview } from '@/hooks/useDevPreview';
import { devPreview } from '@/lib/dev-preview';
import { Button } from '@/components/ui/button';
import { X, Eye } from 'lucide-react';

export function DevPreviewBanner() {
  const { role, clear } = useDevPreview();

  // Only show in development and when preview is active
  if (import.meta.env.PROD || !role) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-2 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">
            Dev Preview Mode: <strong>{devPreview.getDisplayName(role)}</strong>
          </span>
        </div>
        
        <Button
          onClick={() => {
            clear();
            // Navigate back to home
            window.location.href = '/';
          }}
          size="sm"
          variant="ghost"
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4 mr-1" />
          Exit Preview
        </Button>
      </div>
    </div>
  );
}