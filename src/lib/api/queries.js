import { createApiClient } from "./client";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("sirat_admin_token");

export const api = createApiClient(baseURL, getToken);

// Dashboard
export const fetchStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

// Orders
export const fetchOrders = async () => {
  const response = await api.get("/admin/orders");
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.patch(`/admin/orders/${id}/status`, { status });
  return response.data;
};

// Products
export const fetchProducts = async () => {
  const response = await api.get("/products");
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

// Auth
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};
