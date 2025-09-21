const API_BASE_URL = 'http://localhost:8080/flatFit-v1';

export interface User {
  email: string;
  name: string;
  gender?: string;
  city?: string;
  occupation?: string;
  budget?: number;
  aadhaarVerified?: boolean;
}

export interface LoginResponse {
  token: string;
  email: string;
  name: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  gender: string;
  city: string;
  occupation: string;
  budget: number;
}

export const auth = {
  // Storage helpers
  setToken: (token: string) => localStorage.setItem('flatfit_token', token),
  getToken: () => localStorage.getItem('flatfit_token'),
  removeToken: () => localStorage.removeItem('flatfit_token'),
  
  setUser: (user: Partial<User>) => localStorage.setItem('flatfit_user', JSON.stringify(user)),
  getUser: (): Partial<User> | null => {
    const user = localStorage.getItem('flatfit_user');
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => localStorage.removeItem('flatfit_user'),
  
  isAuthenticated: () => !!localStorage.getItem('flatfit_token'),
  
  // API calls
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    auth.setToken(data.token);
    auth.setUser({ email: data.email, name: data.name });
    return data;
  },
  
  register: async (data: RegisterRequest): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
  },
  
  logout: () => {
    auth.removeToken();
    auth.removeUser();
    window.location.href = '/';
  },
  
  // API helper with auth header
  fetchWithAuth: async (endpoint: string, options: RequestInit = {}) => {
    const token = auth.getToken();
    if (!token) {
      throw new Error('No auth token');
    }
    
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  },
};