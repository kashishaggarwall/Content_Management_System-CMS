import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to attach auth headers from localStorage
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem("cms_user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.userId) {
        config.headers["X-User-Id"] = user.userId;
      }
      if (user.token) {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
});

// Response interceptor for friendly error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (typeof error.response?.data === "string" ? error.response.data : "") ||
      error.message ||
      "An unexpected error occurred";
    error.friendlyMessage = message;
    return Promise.reject(error);
  },
);

// ================= AUTH APIs =================
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const logout = (userId) =>
  api.post("/auth/logout", {}, { headers: { "X-User-Id": userId } });

export const getCurrentUser = (userId) =>
  api.get("/auth/me", { headers: { "X-User-Id": userId } });

// ================= DASHBOARD APIs =================
export const getDashboardStats = () => api.get("/dashboard/stats");

// ================= ASSETS APIs =================
export const getAssets = (params = {}) => api.get("/assets", { params });

export const getAssetById = (id) => api.get(`/assets/${id}`);

export const uploadAsset = (formData) => api.post("/assets/upload", formData);

export const updateAsset = (id, formDataOrDto, isMultipart = false) => {
  const data = isMultipart
    ? Object.fromEntries(formDataOrDto.entries())
    : formDataOrDto;

  if (data.categoryId) {
    data.categoryId = Number(data.categoryId);
  }

  if (typeof data.tags === "string") {
    data.tags = data.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return api.put(`/assets/${id}`, data);
};
export const deleteAsset = (id) => api.delete(`/assets/${id}`);

export const getAssetPreviewUrl = (id) =>
  `${API_BASE_URL}/assets/${id}/preview`;

export const getAssetDownloadUrl = (id) =>
  `${API_BASE_URL}/assets/${id}/download`;

// ================= CATEGORIES APIs =================
export const getCategories = () => api.get("/categories");

export const getCategoryById = (id) => api.get(`/categories/${id}`);

export const createCategory = (category) => api.post("/categories", category);

export const updateCategory = (id, category) =>
  api.put(`/categories/${id}`, category);

export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// ================= TAGS APIs =================
export const getTags = () => api.get("/tags");

export const getTagById = (id) => api.get(`/tags/${id}`);

export const createTag = (tag) => api.post("/tags", tag);

export const updateTag = (id, tag) => api.put(`/tags/${id}`, tag);

export const deleteTag = (id) => api.delete(`/tags/${id}`);

// ================= USERS APIs =================
export const getUsers = (search) =>
  api.get("/users", { params: search ? { search } : {} });

export const getUserById = (id) => api.get(`/users/${id}`);

export const createUser = (user) => api.post("/users", user);

export const updateUser = (id, user) => api.put(`/users/${id}`, user);

export const toggleUserStatus = (id) => api.patch(`/users/${id}/toggle-status`);

export const deleteUser = (id) => api.delete(`/users/${id}`);

// ================= ROLES & PERMISSIONS APIs =================
export const getRoles = () => api.get("/roles");

export const getRoleById = (id) => api.get(`/roles/${id}`);

export const getPermissions = () => api.get("/roles/permissions");

export const updateRolePermissions = (roleId, permissionIds) =>
  api.put(`/roles/${roleId}/permissions`, { permissionIds });

// ================= VERSION HISTORY APIs =================
export const getVersions = () => api.get("/versions");

export const getVersionsByAsset = (assetId) =>
  api.get(`/versions/asset/${assetId}`);

// ================= ACTIVITY LOGS APIs =================
export const getActivities = (params = {}) =>
  api.get("/activities", { params });

export const getRecentActivities = (limit = 10) =>
  api.get("/activities/recent", { params: { limit } });

export default api;
