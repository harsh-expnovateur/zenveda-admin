// src/utils/axiosInstance.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // refresh token cookie
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    error ? prom.reject(error) : prom.resolve(token);
  });
  failedQueue = [];
};

// -------------------- REQUEST INTERCEPTOR --------------------
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------- RESPONSE INTERCEPTOR --------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;

        localStorage.setItem("token", accessToken);

        axiosInstance.defaults.headers.common.Authorization =
          `Bearer ${accessToken}`;
        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
