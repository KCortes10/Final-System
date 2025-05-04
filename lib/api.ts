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

// Make an API request
async function apiRequest(
  endpoint: string, 
  method: string = 'GET', 
  data: any = null, 
  includeToken: boolean = true
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeToken) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const options: RequestInit = {
    method,
    headers,
  };
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Handle error responses
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    
    return response.json();
  } catch (error) {
    console.error(`API error for ${endpoint}:`, error);
    throw error;
  }
}

// Uploads API functions
export const uploadsAPI = {
  // Upload an image
  async uploadImage(file: File, title: string, description: string, price: number): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price.toString());
    
    const token = getToken();
    const headers: HeadersInit = {
      Authorization: token ? `Bearer ${token}` : '',
    };
    
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }
    
    return response.json();
  },
  
  // Get images by user
  async getImagesByUser(userId: string): Promise<any> {
    return apiRequest(`/uploads/user?userId=${userId}`);
  },
  
  // Get image by id
  async getImageById(id: string): Promise<any> {
    return apiRequest(`/uploads/${id}`);
  },
  
  // Get all images
  async getAllImages(): Promise<any> {
    return apiRequest('/uploads');
  },
};

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
      // Store email for profile consistency
      if (response.user && response.user.email) {
        localStorage.setItem('userEmail', response.user.email);
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
      localStorage.removeItem('userEmail');
    }
  },
  
  // Get the current user's profile
  async getProfile(): Promise<any> {
    // Add user info from localStorage as query parameters for profile consistency
    let endpoint = '/auth/profile';
    
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (userEmail) params.append('email', userEmail);
      
      // Add query string if we have params
      if (params.toString()) {
        endpoint = `${endpoint}?${params.toString()}`;
      }
    }
    
    return apiRequest(endpoint);
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