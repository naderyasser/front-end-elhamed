/**
 * Centralized authentication helper for Admin Dashboard API calls.
 * Uses Session Cookie-based authentication (HTTP-only cookies).
 */

// Cached CSRF token — fetched once per session and reused
let _csrfToken: string | null = null;

/**
 * Fetch (and cache) the CSRF token from the Flask backend.
 * Required for all mutating requests (POST, PUT, DELETE).
 */
export async function getCsrfToken(): Promise<string> {
  if (_csrfToken) return _csrfToken;
  try {
    const res = await fetch('/api/flask/admin/api/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      _csrfToken = data.csrf_token ?? null;
    }
  } catch {
    // silently fall through — request will fail CSRF and surface the error normally
  }
  return _csrfToken ?? '';
}

/**
 * Invalidate the cached CSRF token (call on logout or session expiry).
 */
export function clearCsrfToken(): void {
  _csrfToken = null;
}

/**
 * Check if admin session is active by verifying with the server.
 * Falls back to a quick localStorage hint for immediate UI, but
 * the real check is the HTTP-only cookie validated server-side.
 */
export const getAdminToken = () => {
  if (typeof window === 'undefined') return null;
  // The real auth is the HTTP-only session cookie; this is just a UI hint
  return localStorage.getItem('admin_logged_in') === 'true' ? 'session_active' : null;
};

/**
 * Check if user is authenticated, redirect to login if not
 * @returns true if authenticated, false otherwise
 */
export function ensureAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
  if (!isLoggedIn) {
    if (window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
    return false;
  }
  return true;
}

/**
 * Wraps fetch with session cookie authentication for admin API
 * Handles 401 responses by redirecting login
 *
 * @param url API endpoint URL
 * @param options Fetch options (method, body, etc.)
 * @returns Promise<Response>
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('admin_logged_in');
        clearCsrfToken();
        window.location.href = '/admin/login';
      }
      throw new Error('Unauthorized');
    }

    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Convenience method for GET requests with authentication
 */
export async function authenticatedGet(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'GET' });
}

/**
 * Convenience method for POST requests with authentication
 */
export async function authenticatedPost(
  url: string,
  body: FormData | Record<string, unknown>
): Promise<Response> {
  const isFormData = body instanceof FormData;
  const csrfToken = await getCsrfToken();
  return authenticatedFetch(url, {
    method: 'POST',
    body: isFormData ? body : JSON.stringify(body),
    headers: isFormData
      ? { 'X-CSRF-Token': csrfToken }
      : { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
  });
}

/**
 * Convenience method for PUT requests with authentication
 */
export async function authenticatedPut(
  url: string,
  body: FormData | Record<string, unknown>
): Promise<Response> {
  const isFormData = body instanceof FormData;
  const csrfToken = await getCsrfToken();
  return authenticatedFetch(url, {
    method: 'PUT',
    body: isFormData ? body : JSON.stringify(body),
    headers: isFormData
      ? { 'X-CSRF-Token': csrfToken }
      : { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
  });
}

/**
 * Convenience method for DELETE requests with authentication
 */
export async function authenticatedDelete(url: string): Promise<Response> {
  const csrfToken = await getCsrfToken();
  return authenticatedFetch(url, {
    method: 'DELETE',
    headers: { 'X-CSRF-Token': csrfToken },
  });
}

/**
 * Clear the authentication flag and logout
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_logged_in');
  clearCsrfToken();
  // Also call server-side logout to clear the session cookie
  fetch('/api/flask/admin/logout', { credentials: 'include' }).finally(() => {
    window.location.href = '/admin/login';
  });
}
