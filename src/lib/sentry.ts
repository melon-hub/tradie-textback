import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Initialize Sentry in production or if explicitly configured
  const dsn = import.meta.env.VITE_SENTRY_DSN || "https://204af7618f45e756f5e2ebf68c8bbcdd@o4509796948639744.ingest.us.sentry.io/4509796951392256";
  
  // Initialize in both development and production when DSN is available
  if (dsn) {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      sendDefaultPii: false, // Don't send PII by default for privacy
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0, // 10% in prod, 100% in dev
      // Set trace propagation targets for your backend
      tracePropagationTargets: [
        "localhost",
        /^https:\/\/.*\.supabase\.co/,
        /^https:\/\/tradietext\.com\.au/,
      ],
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      // Enable console logs in development
      enableLogs: !import.meta.env.PROD,
      
      // Filtering
      beforeSend(event, hint) {
        // Filter out specific errors if needed
        if (event.exception) {
          const error = hint.originalException;
          
          // Don't send network errors during development
          if (error && error.message && error.message.includes('NetworkError')) {
            return null;
          }
          
          // Don't send cancelled requests
          if (error && error.name === 'AbortError') {
            return null;
          }
        }
        
        // Remove sensitive data
        if (event.request) {
          // Remove auth headers
          if (event.request.headers) {
            delete event.request.headers['Authorization'];
            delete event.request.headers['X-Api-Key'];
          }
          
          // Remove sensitive cookies
          if (event.request.cookies) {
            delete event.request.cookies['session'];
            delete event.request.cookies['auth-token'];
          }
        }
        
        return event;
      },
      
      // Ignore specific errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        // Random network errors
        'Network request failed',
        'NetworkError',
        'Failed to fetch',
        // Resize observer errors
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        // Non-critical console warnings
        'Non-Error promise rejection captured',
      ],
    });
  }
};

export const captureError = (error: Error, context?: Record<string, any>) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    // In development, just log to console
    console.error('Error captured:', error, context);
  }
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else {
    // In development, just log to console
    console.log(`[${level.toUpperCase()}]:`, message);
  }
};

export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(user);
  }
};

export const clearUserContext = () => {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(null);
  }
};