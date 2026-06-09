const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("athletica_token") : null;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {  
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (_) {
      // response might not be json
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content or empty responses
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (e) {
    return null;
  }
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, body?: any, options?: RequestInit) =>
    request(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint: string, body?: any, options?: RequestInit) =>
    request(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  del: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: "DELETE" }),
};
export default api;
