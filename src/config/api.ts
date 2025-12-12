// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  TIMEOUT: 30000, // 30 seconds
};

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  try {
    // Try to get token directly
    const token = localStorage.getItem('token');
    // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMSIsImVtYWlsIjoiYWRtaW5AYWlrbGlzb2x2ZS5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjQ4MzE4MTcsImV4cCI6MTc2NDgzNTQxN30.T-6swaApgbfLIA_GjdI2xdmdCPT2nEeLwEfYaHqPmek';
    if (token && token !== 'undefined' && token !== null) {
      return token;
    }
    
    // Try to get from user data
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.token) {
        return user.token;
      }
    }
    
    // Fallback to static users
    const staticUser = localStorage.getItem('static_user');
    if (staticUser) {
      const user = JSON.parse(staticUser);
      return user.token || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// API request helper
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  console.log('API Request:', {
    method: options.method || 'GET',
    url,
    hasToken: !!token,
    token: token ? token.substring(0, 30) + '...' : 'none'
  });
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      cache: 'no-cache', // Prevent caching for development
    });
    
    // Handle 304 Not Modified - return empty or cached data
    if (response.status === 304) {
      console.warn('API returned 304 Not Modified - using cached data or empty response');
      // Try to get data anyway
      try {
        const data = await response.json();
        return data;
      } catch {
        // If no JSON, return empty success response
        return { success: true, data: { movements: [], pagination: {} } };
      }
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      // Create error with response data attached for validation error handling
      const error: any = new Error(data.message || `API Error: ${response.status}`);
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: data
      };
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('API Request Error:', error);
    // If error already has response data, preserve it
    if (!error.response && error.message) {
      // Try to preserve error message
      const preservedError: any = new Error(error.message);
      preservedError.response = error.response || { data: { message: error.message } };
      throw preservedError;
    }
    throw error;
  }
}

