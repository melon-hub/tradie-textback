import { useState, useEffect } from 'react';
import { devPreview, DevPreviewRole } from '@/lib/dev-preview';

export function useDevPreview() {
  const [role, setRole] = useState<DevPreviewRole>(devPreview.getRole());

  useEffect(() => {
    // Listen for changes from other components/tabs
    const handleChange = (event: CustomEvent) => {
      setRole(event.detail as DevPreviewRole);
    };

    window.addEventListener('devPreviewChange', handleChange as EventListener);
    return () => {
      window.removeEventListener('devPreviewChange', handleChange as EventListener);
    };
  }, []);

  const setPreviewRole = (newRole: DevPreviewRole) => {
    devPreview.setRole(newRole);
    setRole(newRole);
  };

  const clearPreview = () => {
    devPreview.clear();
    setRole(null);
  };

  return {
    role,
    isActive: devPreview.isActive(),
    setRole: setPreviewRole,
    clear: clearPreview,
    getDisplayName: devPreview.getDisplayName
  };
}