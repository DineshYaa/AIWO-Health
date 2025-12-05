import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// User type based on the login response
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: number;
  role_base_id: string | null;
  contact?: string;
  // Doctor-specific fields
  doctor_id?: string;
  doctor_user_id?: string;
  doctor_first_name?: string;
  doctor_last_name?: string;
  doctor_email?: string;
  doctor_contact?: string;
  doctor_type?: number;
  designation_id?: string;
  specialization_id?: string;
  qualification?: string;
  experience?: number;
  inperson_consultation?: string;
  tele_consultation?: string;
  status?: number;
}

export interface AuthData {
  user: User;
  token: string;
  expiresIn: string;
}

export function useAuth() {
  // Try to get auth data from localStorage
  const getStoredAuth = (): AuthData | null => {
    try {
      const stored = localStorage.getItem('auth');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const { data: authData, isLoading } = useQuery<AuthData | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      // First check localStorage
      const stored = getStoredAuth();
      if (stored && stored.token) {
        return stored;
      }
      return null;
    },
    retry: false,
    staleTime: Infinity, // Don't refetch automatically
  });

  console.log("authData : ",authData)

  const logout = useMutation({
    mutationFn: async () => {
      // Clear localStorage
      localStorage.removeItem('auth');
      // Optionally call logout endpoint
      try {
        await apiRequest('POST', '/auth/logout', {});
      } catch (error) {
        console.error('Logout API error:', error);
      }
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Redirect to login
      window.location.href = '/login';
    },
  });

  return {
    user: authData?.user || null,
    token: authData?.token || null,
    isLoading,
    isAuthenticated: !!(authData?.user && authData?.token),
    logout: logout.mutate,
  };
}

// Helper function to store auth data
export function setAuthData(data: AuthData) {
  localStorage.setItem('auth', JSON.stringify(data));
  // Update the query cache
  queryClient.setQueryData(['/api/auth/user'], data);
}

// Helper function to clear auth data
export function clearAuthData() {
  localStorage.removeItem('auth');
  queryClient.setQueryData(['/api/auth/user'], null);
}
