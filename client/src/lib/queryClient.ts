import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { buildApiUrl } from "./apiConfig";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Store token globally (will be set by auth provider)
let globalAuthToken: string | null = null;

export function setGlobalAuthToken(token: string | null) {
  globalAuthToken = token;
}

export function getGlobalAuthToken(): string | null {
  return globalAuthToken;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  const headers: HeadersInit = {};
  const upperMethod = method.toUpperCase();

  // Only add Content-Type header for methods that support a body
  if (data && !["GET", "HEAD"].includes(upperMethod)) {
    headers["Content-Type"] = "application/json";
  }

  // Skip adding token for /auth endpoints (login, register, etc.)
  const isAuthEndpoint = url.includes("/auth");
  if (globalAuthToken && !isAuthEndpoint) {
    headers["Authorization"] = `Bearer ${globalAuthToken}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  // Only include body for methods that support it
  if (data && !["GET", "HEAD"].includes(upperMethod)) {
    fetchOptions.body = JSON.stringify(data);
  }

  // Build full URL with base URL
  const fullUrl = buildApiUrl(url);
  const res = await fetch(fullUrl, fetchOptions);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: HeadersInit = {};

    // Build full URL with base URL
    const endpoint = queryKey.join("/") as string;
    const fullUrl = buildApiUrl(endpoint);

    // Skip adding token for /auth endpoints
    const isAuthEndpoint = fullUrl.includes("/auth");
    if (globalAuthToken && !isAuthEndpoint) {
      headers["Authorization"] = `Bearer ${globalAuthToken}`;
    }

    const res = await fetch(fullUrl, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
