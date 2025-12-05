import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, setGlobalAuthToken } from "@/lib/queryClient";
import { useEffect } from "react";

// User type based on the login response
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: number;
  role_base_id: string | null;
  status: number;
  contact?: string;
}

export interface DoctorData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country_code: string;
  qualification: string;
  designation_id: string;
  specialization_id: string;
  license_no: string;
  user_id: string;
  role_id: string;
  gender_type: string;
  experience: number;
  about_me: string;
  doctor_serial_no: string;
  inperson_consultation: string;
  tele_consultation: string;
  status: number;
  doctor_type: number;
  doctor_commission: number;
  profile_url?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  Designation?: { Name: string };
  Specialization?: { Name: string };
}

export interface AssociatedData {
  type: "doctor" | "patient" | "admin";
  doctor?: { data: DoctorData };
  // Add other types as needed
}

export interface AuthData {
  user: User;
  token: string;
  refreshToken: string;
  associatedData?: AssociatedData;
}

export function useAuth() {
  // Try to get auth data from localStorage
  const getStoredAuth = (): AuthData | null => {
    try {
      const stored = localStorage.getItem("auth");
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

  // Update global auth token whenever authData changes
  useEffect(() => {
    if (authData?.token) {
      setGlobalAuthToken(authData.token);
    } else {
      setGlobalAuthToken(null);
    }
  }, [authData]);

  console.log("authData : ", authData);

  const logout = useMutation({
    mutationFn: async () => {
      // Clear localStorage
      localStorage.removeItem("auth");
      // Optionally call logout endpoint
      try {
        await apiRequest("POST", "/auth/logout", {});
      } catch (error) {
        console.error("Logout API error:", error);
      }
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      // Redirect to login
      window.location.href = "/login";
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
  localStorage.setItem("auth", JSON.stringify(data));
  // Update the query cache
  queryClient.setQueryData(["/api/auth/user"], data);
  // Update global auth token
  setGlobalAuthToken(data.token);
}

// Helper function to clear auth data
export function clearAuthData() {
  localStorage.removeItem("auth");
  queryClient.setQueryData(["/api/auth/user"], null);
  // Clear global auth token
  setGlobalAuthToken(null);
}
