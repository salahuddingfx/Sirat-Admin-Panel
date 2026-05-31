import axios from "axios";
import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().or(z.literal(""))
});

const env = envSchema.parse(import.meta.env);

export const adminApi = axios.create({
  baseURL: env.VITE_API_BASE_URL || undefined,
  headers: {
    "Content-Type": "application/json"
  }
});

export const adminStatSchema = z.object({
  label: z.string(),
  value: z.string(),
  delta: z.string()
});

export const adminProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  stock: z.string(),
  status: z.string()
});

export const adminOrderSchema = z.object({
  id: z.string(),
  customer: z.string(),
  status: z.string(),
  total: z.string()
});

export type AdminStat = z.infer<typeof adminStatSchema>;
export type AdminProduct = z.infer<typeof adminProductSchema>;
export type AdminOrder = z.infer<typeof adminOrderSchema>;

export async function fetchAdminStats(): Promise<AdminStat[]> {
  const response = await adminApi.get("/admin/stats");
  return z.array(adminStatSchema).parse(response.data);
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const response = await adminApi.get("/admin/products");
  return z.array(adminProductSchema).parse(response.data);
}

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  const response = await adminApi.get("/admin/orders");
  return z.array(adminOrderSchema).parse(response.data);
}

export async function fetchCustomers() {
  const response = await adminApi.get("/admin/customers");
  return response.data as Array<{ id: string; name: string; email: string }>;
}

export async function fetchAdminReviews() {
  const response = await adminApi.get("/admin/reviews");
  return response.data as Array<{ id: string; customer: string; rating: number; text: string }>;
}

export async function fetchCoupons() {
  const response = await adminApi.get("/admin/coupons");
  return response.data as Array<{ id: string; code: string; discount: string }>;
}
