const API_BASE = "http://localhost:5001/api";

const TOKEN_KEY = "voyage_token";
const USER_KEY = "voyage_user";

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t) => localStorage.setItem(TOKEN_KEY, t),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
  setUser: (u) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isAuthed: () => !!localStorage.getItem(TOKEN_KEY),
};

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = auth.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error("Network error — is the server running on :5001?");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* not JSON */
  }

  if (!res.ok) {
    if (res.status === 401) auth.logout();
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body }),
  login: (body) => request("/auth/login", { method: "POST", body }),
  me: () => request("/auth/me"),
  updateMe: (body) => request("/auth/me", { method: "PUT", body }),
  listTrips: () => request("/trips"),
  getTrip: (id) => request(`/trips/${id}`),
  createTrip: (body) => request("/trips", { method: "POST", body }),
  updateTrip: (id, body) => request(`/trips/${id}`, { method: "PUT", body }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: "DELETE" }),
  planTrip: (body) => request("/plan-trip", { method: "POST", body }),
};

export default api;
