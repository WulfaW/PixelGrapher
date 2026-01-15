// API utility to handle base URL based on environment
export function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback for development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3000';
  }
  // Default to known production backend if env var is missing
  return 'https://pixelgrapher-production.up.railway.app';
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
