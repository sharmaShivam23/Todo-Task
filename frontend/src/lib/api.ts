import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================================
// 🔐 REQUEST INTERCEPTOR
// ================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================================
// ❗ RESPONSE INTERCEPTOR
// ================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Prevent redirect loop (e.g., already on /signin)
    const currentPath = window.location.pathname;

    if (status === 401 && currentPath !== "/signin") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);

export default api;
