import axios from "axios";

// Standardize backend base URL resolution:
// If VITE_API_URL is configured (e.g. "https://cctv-surveillance.onrender.com" on Netlify),
// normalize it by stripping any trailing slash and ensuring /api is appended once.
// If VITE_API_URL is not provided (local dev default), fallback to "http://localhost:3000/api".
const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, "");
export const BASE_API_URL = cleanBaseUrl.endsWith("/api")
    ? cleanBaseUrl
    : `${cleanBaseUrl}/api`;

// Export origin root (useful for static video /uploads/ paths)
export const BACKEND_ORIGIN = cleanBaseUrl.endsWith("/api")
    ? cleanBaseUrl.slice(0, -4)
    : cleanBaseUrl;

// Helper to resolve backend media assets (e.g. annotated video URLs)
export const resolveMediaUrl = (relativeUrl) => {
    if (!relativeUrl) return "";
    if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
        return relativeUrl;
    }
    const cleanPath = relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
    return `${BACKEND_ORIGIN}${cleanPath}`;
};

const API = axios.create({
    baseURL: BASE_API_URL,
    withCredentials: true,
});

// Auto-attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercept 401s to handle token expiration cleanly
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const path = window.location.pathname;
            if (path !== "/" && path !== "/signup" && path !== "/forgot-password") {
                // Token invalid or expired
            }
        }
        return Promise.reject(error);
    }
);

// ================= AUTH API =================
export const login = (data) => API.post("/auth/login", data);
export const signup = (data) => API.post("/auth/signup", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const checkStatus = () => API.get("/auth/check-status");

// ================= ORGANIZATION API =================
export const createOrganization = (data) => API.post("/org/create", data);
export const joinOrganization = (data) => API.post("/org/join", data);
export const getOrgProfile = () => API.get("/org/profile");
export const updateOrgSettings = (data) => API.put("/org/settings", data);
export const regenerateJoinCode = () => API.post("/org/regenerate-code");
export const getAllOrganizations = () => API.get("/org/all");

// ================= CAMERA MANAGEMENT API =================
export const getCameras = (params) => API.get("/camera", { params });
export const getCameraById = (id) => API.get(`/camera/${id}`);
export const createCamera = (data) => API.post("/camera", data);
export const updateCamera = (id, data) => API.put(`/camera/${id}`, data);
export const deleteCamera = (id) => API.delete(`/camera/${id}`);

// ================= VIDEO & SURVEILLANCE PROCESSING API =================
export const uploadVideo = (formData) =>
    API.post("/video/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000, // 5 min timeout for AI analysis
    });
export const getVideos = (params) => API.get("/video", { params });
export const getVideoById = (id) => API.get(`/video/${id}`);
export const deleteVideo = (id) => API.delete(`/video/${id}`);
export const getDashboardStats = () => API.get("/video/dashboard-stats");

// ================= EVENTS & INCIDENTS API =================
export const getEvents = (params) => API.get("/event", { params });
export const getEventStats = () => API.get("/event/stats");
export const updateEventStatus = (id, data) => API.put(`/event/${id}`, data);
export const deleteEvent = (id) => API.delete(`/event/${id}`);

// ================= USER & TEAM MANAGEMENT API =================
export const getOrgUsers = () => API.get("/user/org-users");
export const updateUserRole = (id, data) => API.put(`/user/role/${id}`, data);
export const removeUser = (id) => API.delete(`/user/${id}`);
export const getUserProfile = () => API.get("/user/profile");
export const updateProfile = (data) => API.put("/user/profile", data);
export const changePassword = (data) => API.post("/user/change-password", data);

export default API;
