import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * AuthUrlSanitizer
 *
 * Purpose:
 * - Supabase magic-link and passwordless flows often append tokens or error fragments
 *   to the URL (hash or query), e.g.:
 *   - #access_token=...&refresh_token=...&type=magiclink
 *   - #error=access_denied&error_code=otp_expired...
 * - Those fragments can cause router re-navigation and trigger auth listeners multiple times,
 *   resulting in redirect loops.
 *
 * Behavior:
 * - On any navigation, if it detects access_token/error fragments in the URL hash
 *   or otp_expired errors in hash/query, it replaces the URL with a clean version,
 *   preserving the path (and an optional redirect query param).
 * - This component performs a client-side URL cleanup only and does not alter auth state.
 */
export function AuthUrlSanitizer() {
  const location = useLocation();
  const navigate = useNavigate();
  const processedRef = useRef<string>('');

  useEffect(() => {
    const hash = location.hash || "";
    const search = location.search || "";
    const currentUrl = location.pathname + search + hash;

    // Skip if we've already processed this exact URL
    if (processedRef.current === currentUrl) {
      return;
    }

    const hasAccessToken =
      hash.includes("access_token=") || search.includes("access_token=");
    const hasError =
      hash.includes("error=") ||
      search.includes("error=") ||
      hash.includes("error_code=") ||
      search.includes("error_code=");
    const hasOtpExpired =
      hash.includes("otp_expired") || search.includes("otp_expired");
    const hasSupabaseVerify =
      location.pathname.includes("/auth/v1/verify") ||
      search.includes("/auth/v1/verify") ||
      hash.includes("/auth/v1/verify");

    if (hasAccessToken || hasError || hasOtpExpired || hasSupabaseVerify) {
      // Mark this URL as processed
      processedRef.current = currentUrl;

      // For successful auth (has access token, no errors), stay on current path
      if (hasAccessToken && !hasError && !hasOtpExpired) {
        // Just clean the URL hash/params without changing path
        navigate(location.pathname, { replace: true });
        return;
      }

      // For errors, redirect appropriately
      if (hasError || hasOtpExpired) {
        // Parse redirect information from the original request
        const searchParams = new URLSearchParams(search);
        const hashParams = new URLSearchParams(hash.replace('#', ''));
        
        const supabaseRedirect = searchParams.get("redirect_to") || hashParams.get("redirect_to");
        let targetPath = "/auth"; // Default to auth page on error
        
        if (supabaseRedirect) {
          try {
            const url = new URL(supabaseRedirect);
            targetPath = url.pathname;
          } catch {
            targetPath = supabaseRedirect.startsWith('/') ? supabaseRedirect : '/' + supabaseRedirect;
          }
        }

        console.log('AuthUrlSanitizer: Error detected, redirecting to', targetPath, {
          error: hasOtpExpired ? 'otp_expired' : 'auth_error',
          originalPath: location.pathname
        });

        navigate(targetPath, { replace: true });
      }
    }
  }, [location, navigate]);

  return null;
}

export default AuthUrlSanitizer;