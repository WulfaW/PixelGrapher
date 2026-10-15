// API utility to handle base URL based on environment
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Fallback for development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000';
  }
  // Default to Render.com backend
  return 'https://pixelgrapher.onrender.com';
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const token = localStorage.getItem('pg_token') || sessionStorage.getItem('pg_token');
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
}

// Render free tier sleeps when idle; pinging on page load starts waking it before the user's first real request.
export function wakeBackend(): void {
  fetch(`${getApiBaseUrl()}/health`, { mode: 'no-cors' }).catch(() => {});
}
