import { User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, token: string | null, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// User API functions
export const userApi = {
  // Sync user data from Clerk to backend
  syncFromClerk: async (token: string | null): Promise<User> => {
    return apiCall('/users/sync-from-clerk', token, {
      method: 'POST',
    });
  },

  // Get current user profile
  getProfile: async (token: string | null): Promise<User> => {
    console.log('API: Getting user profile');
    const response = await apiCall('/users/profile', token);
    console.log('API: Profile response:', response);
    return response;
  },

  // Update user profile
  updateProfile: async (token: string | null, userData: Partial<User>): Promise<User> => {
    console.log('API: Updating profile with data:', userData);
    const response = await apiCall('/users/profile', token, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    console.log('API: Profile update response:', response);
    return response;
  },

  // Search users
  searchUsers: async (token: string | null, skill?: string): Promise<User[]> => {
    const params = skill ? `?skill=${encodeURIComponent(skill)}` : '';
    return apiCall(`/users/search${params}`, token);
  },
};

// Swap API functions
export const swapApi = {
  // Get swap requests
  getSwapRequests: async (token: string | null) => {
    return apiCall('/swaps', token);
  },

  // Create swap request
  createSwapRequest: async (token: string | null, requestData: any) => {
    console.log('API: Creating swap request with data:', requestData);
    const response = await apiCall('/swaps/request', token, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    console.log('API: Swap request response:', response);
    return response;
  },

  // Accept swap request
  acceptSwapRequest: async (token: string | null, requestId: string) => {
    return apiCall(`/swaps/${requestId}/accept`, token, {
      method: 'PATCH',
    });
  },

  // Reject swap request
  rejectSwapRequest: async (token: string | null, requestId: string) => {
    return apiCall(`/swaps/${requestId}/reject`, token, {
      method: 'PATCH',
    });
  },
};

// Admin API functions
export const adminApi = {
  // Get all users (admin only)
  getAllUsers: async (token: string | null) => {
    return apiCall('/admin/users', token);
  },

  // Get all swap requests (admin only)
  getAllSwaps: async (token: string | null) => {
    return apiCall('/admin/swaps', token);
  },

  // Ban/unban user (admin only)
  banUser: async (token: string | null, userId: string) => {
    return apiCall(`/admin/users/${userId}/ban`, token, {
      method: 'PATCH',
    });
  },
}; 