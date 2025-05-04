// API utility functions for interacting with the backend

// Base API URL - Using local Next.js API routes instead of external backend
const API_BASE_URL = '/api';

// Get the JWT token from local storage
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Set the JWT token in local storage
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

// Remove the JWT token from local storage
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getToken();
}

// Make API requests with authentication headers if token exists
async function apiRequest(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  isFormData: boolean = false
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Making ${method} request to: ${url}`);
  
  const token = getToken();
  
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!isFormData && data) {
    headers['Content-Type'] = 'application/json';
  }
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (data) {
    if (isFormData) {
      options.body = data;
      
      // For debugging - log FormData contents
      if (data instanceof FormData) {
        console.log('FormData contents:', {
          fields: [...data.keys()],
          hasFile: data.has('file'),
          fileType: data.get('file') instanceof File ? (data.get('file') as File).type : 'not a file'
        });
      }
    } else {
      options.body = JSON.stringify(data);
      console.log('Request payload:', JSON.stringify(data));
    }
  }
  
  try {
    console.log('Sending request with options:', JSON.stringify({
      method,
      headers,
      bodyType: data ? (isFormData ? 'FormData' : 'JSON') : 'none',
      url
    }));
    
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      
      if (!response.ok) {
        console.error('API error response:', json);
        throw new Error(json.message || `API request failed with status ${response.status}`);
      }
      
      return json;
    }
    
    // For non-JSON responses like image downloads
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error (non-JSON):', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Auth API functions
export const authAPI = {
  // Register a new user
  async register(username: string, email: string, password: string): Promise<any> {
    const data = { username, email, password };
    return apiRequest('/auth/register', 'POST', data);
  },
  
  // Login a user
  async login(email: string, password: string): Promise<any> {
    const data = { email, password };
    const response = await apiRequest('/auth/login', 'POST', data);
    
    if (response.token) {
      setToken(response.token);
      // Also store the user ID for use in user-specific requests
      if (response.user && response.user.id) {
        localStorage.setItem('userId', response.user.id);
      }
    }
    
    return response;
  },
  
  // Logout a user
  logout(): void {
    removeToken();
    // Also remove userId and other user-specific data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
  },
  
  // Get the current user's profile
  async getProfile(): Promise<any> {
    return apiRequest('/auth/profile');
  },
  
  // Update the current user's profile
  async updateProfile(data: any): Promise<any> {
    return apiRequest('/auth/profile', 'PUT', data);
  }
};

// Image API functions
export const imageAPI = {
  // Get all images (with optional filtering)
  async getImages(options: { category?: string; q?: string } = {}): Promise<any> {
    let endpoint = '/uploads';
    const params = new URLSearchParams();
    
    if (options.category) {
      params.append('category', options.category);
    }
    
    if (options.q) {
      params.append('q', options.q);
    }
    
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
    
    return apiRequest(endpoint);
  },
  
  // Get an image by ID
  async getImage(id: string): Promise<any> {
    return apiRequest(`/uploads/${id}/metadata`);
  },
  
  // Upload a new image
  async uploadImage(file: File, metadata: { 
    title: string; 
    description?: string; 
    category?: string;
    price?: string | number;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata.title) {
      formData.append('title', metadata.title);
    }
    
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    
    if (metadata.category) {
      formData.append('category', metadata.category);
    }
    
    if (metadata.price) {
      formData.append('price', metadata.price.toString());
    }
    
    return apiRequest('/uploads', 'POST', formData, true);
  },
  
  // Update image metadata
  async updateImage(id: string, data: any): Promise<any> {
    return apiRequest(`/uploads/${id}`, 'PUT', data);
  },
  
  // Delete an image
  async deleteImage(id: string): Promise<any> {
    return apiRequest(`/uploads/${id}`, 'DELETE');
  },
  
  // Get the URL for an image
  getImageUrl(id: string): string {
    return `${API_BASE_URL}/uploads/${id}`;
  },
  
  // Get the URL for an image thumbnail
  getThumbnailUrl(id: string): string {
    return `${API_BASE_URL}/uploads/${id}/thumbnail`;
  }
}; 