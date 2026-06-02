import { createApiClient } from "./client";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("sirat_admin_token");

export const api = createApiClient(baseURL, getToken);

// Dashboard
export const fetchStats = async (options = {}) => {
  const response = await api.get("/admin/stats", options);
  return response.data;
};

// Orders
export const fetchOrders = async (options = {}) => {
  const response = await api.get("/admin/orders", options);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};

// Products
export const fetchProducts = async (options = {}) => {
  const response = await api.get("/products", options);
  return response.data;
};

export const createProduct = async (formData) => {
  const response = await api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateProduct = async (id, formData) => {
  const response = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Hero Slider
export const fetchHeroSlides = async (options = {}) => {
  const response = await api.get("/admin/hero", options);
  return response.data;
};

export const createHeroSlide = async (slideData) => {
  const response = await api.post("/admin/hero", slideData);
  return response.data;
};

export const updateHeroSlide = async (id, slideData) => {
  const response = await api.put(`/admin/hero/${id}`, slideData);
  return response.data;
};

export const deleteHeroSlide = async (id) => {
  const response = await api.delete(`/admin/hero/${id}`);
  return response.data;
};

// Reviews
export const fetchAllReviews = async (options = {}) => {
  const response = await api.get("/admin/reviews", options);
  return response.data;
};

export const updateReviewApproval = async (id, isApproved) => {
  const response = await api.patch(`/admin/reviews/${id}/approve`, { isApproved });
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await api.delete(`/admin/reviews/${id}`);
  return response.data;
};

// Contacts
export const fetchAllContacts = async (options = {}) => {
  const response = await api.get("/admin/contacts", options);
  return response.data;
};

export const markContactAsRead = async (id) => {
  const response = await api.patch(`/admin/contacts/${id}/read`);
  return response.data;
};

export const deleteContact = async (id) => {
  const response = await api.delete(`/admin/contacts/${id}`);
  return response.data;
};

// Coupons
export const fetchAllCoupons = async (options = {}) => {
  const response = await api.get("/admin/coupons", options);
  return response.data;
};

export const createCoupon = async (couponData) => {
  const response = await api.post("/admin/coupons", couponData);
  return response.data;
};

export const updateCoupon = async (id, couponData) => {
  const response = await api.put(`/admin/coupons/${id}`, couponData);
  return response.data;
};

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/admin/coupons/${id}`);
  return response.data;
};

// Users
export const fetchAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const adminDeleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

// Auth
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Settings
export const fetchSettings = async () => {
  const response = await api.get("/settings");
  return response.data;
};

export const updateSettings = async (settingsData) => {
  const isFormData = settingsData instanceof FormData;
  const response = await api.put("/settings", settingsData, {
    headers: {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json"
    }
  });
  return response.data;
};

// Categories
export const fetchCategories = async (options = {}) => {
  const response = await api.get("/categories", options);
  return response.data;
};

export const createCategory = async (formData) => {
  const response = await api.post("/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateCategory = async (id, formData) => {
  const response = await api.put(`/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// Flash Sale
export const fetchFlashSale = async () => {
  const response = await api.get("/admin/flash-sale");
  return response.data;
};

export const upsertFlashSale = async (data) => {
  const response = await api.put("/admin/flash-sale", data);
  return response.data;
};

export const toggleFlashSale = async () => {
  const response = await api.patch("/admin/flash-sale/toggle");
  return response.data;
};
