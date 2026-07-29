const API_BASE = "/api";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let accessToken: string | null = localStorage.getItem("sp_token");

export function setToken(token: string | null) {
  accessToken = token;
  if (token) {
    localStorage.setItem("sp_token", token);
  } else {
    localStorage.removeItem("sp_token");
  }
}

export function getToken() {
  return accessToken;
}

async function handleResponse(res: Response, endpoint?: string) {
  if (res.status === 401) {
    if (endpoint === "/admin/auth/login") {
      const errBody = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(errBody.message || errBody.error || "Invalid email or password");
    }
    // Try token refresh
    const refreshRes = await fetch(`${API_BASE}/admin/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setToken(data.accessToken);
      return null; // Caller should retry
    }
    setToken(null);
    window.location.href = "/admin/login";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errBody.message || errBody.error || `Request failed (${res.status})`);
  }
  // Handle 204 no content
  if (res.status === 204) return null;
  return res.json();
}

export async function api(endpoint: string, options: FetchOptions = {}) {
  const { skipAuth, ...fetchOpts } = options;
  const headers: Record<string, string> = {
    ...(fetchOpts.headers as Record<string, string>),
  };

  if (!skipAuth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Don't set content-type for FormData (browser sets it with boundary)
  if (!(fetchOpts.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOpts,
    headers,
    credentials: "include",
  });

  const result = await handleResponse(res, endpoint);
  if (result === null && res.status === 401) {
    // Retry after token refresh
    headers["Authorization"] = `Bearer ${accessToken}`;
    const retryRes = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOpts,
      headers,
      credentials: "include",
    });
    return handleResponse(retryRes, endpoint);
  }
  return result;
}

export async function apiGet(endpoint: string) {
  return api(endpoint, { method: "GET" });
}

export async function apiPost(endpoint: string, body?: unknown) {
  return api(endpoint, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export async function apiPut(endpoint: string, body?: unknown) {
  return api(endpoint, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export async function apiDelete(endpoint: string) {
  return api(endpoint, { method: "DELETE" });
}
