// Dev Preview Bypass - Simple role switching for development
// This doesn't touch Supabase auth at all, just lets you preview pages as different roles

export type DevPreviewRole = 'tradie' | 'client' | 'admin' | null;

const DEV_PREVIEW_KEY = 'devPreviewRole';

export const devPreview = {
  // Get current preview role
  getRole(): DevPreviewRole {
    if (typeof window === 'undefined') return null;
    const role = localStorage.getItem(DEV_PREVIEW_KEY);
    return role as DevPreviewRole;
  },

  // Set preview role
  setRole(role: DevPreviewRole) {
    if (typeof window === 'undefined') return;
    
    if (role === null) {
      localStorage.removeItem(DEV_PREVIEW_KEY);
    } else {
      localStorage.setItem(DEV_PREVIEW_KEY, role);
    }
    
    // Trigger a custom event so components can react
    window.dispatchEvent(new CustomEvent('devPreviewChange', { detail: role }));
  },

  // Clear preview mode
  clear() {
    this.setRole(null);
  },

  // Check if in preview mode
  isActive(): boolean {
    return this.getRole() !== null;
  },

  // Get user-friendly display name
  getDisplayName(role: DevPreviewRole): string {
    if (!role) return '';
    
    const names = {
      tradie: 'Tradie',
      client: 'Client',
      admin: 'Admin'
    };
    
    return names[role] || role;
  },

  // Navigate to appropriate page for role
  navigateToRolePage(role: DevPreviewRole) {
    if (!role) return;
    
    const routes = {
      tradie: '/dashboard',
      client: '/intake',
      admin: '/admin'
    };
    
    const route = routes[role];
    if (route && window.location.pathname !== route) {
      window.location.href = route;
    }
  }
};