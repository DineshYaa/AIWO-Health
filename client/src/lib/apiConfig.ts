// API Configuration
export const API_CONFIG = {
  // Empty base URL - Vite proxy will handle routing to backend
  BASE_URL: "",
  TIMEOUT: 30000, // 30 seconds
};

// Helper function to build full API URL
export function buildApiUrl(endpoint: string): string {
  // If the endpoint already starts with http/https, return as is
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
    return endpoint;
  }

  // If BASE_URL is empty, return the endpoint as-is (for proxy)
  if (!API_CONFIG.BASE_URL) {
    return endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  }

  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  // Combine base URL with endpoint
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
}
