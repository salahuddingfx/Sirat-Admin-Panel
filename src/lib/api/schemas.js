import { z } from "zod";

export const idSchema = z.string().min(1);

export const productVariantSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  priceDelta: z.number().default(0),
  inStock: z.boolean().default(true)
});

export const productSchema = z.object({
  id: idSchema,
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.number().nonnegative(),
  oldPrice: z.number().nonnegative().optional().nullable(),
  costPrice: z.number().nonnegative().default(0),
  currency: z.string().default("USD"),
  category: z.string().min(1),
  images: z.array(z.string().url()).default([]),
  rating: z.number().min(0).max(5).default(0),
  featured: z.boolean().default(false),
  variants: z.array(productVariantSchema).default([])
});

export const trackOrderSchema = z.object({
  orderId: idSchema,
  email: z.string().email().optional(),
  phone: z.string().optional()
});

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10)
});

export const adminStatSchema = z.object({
  label: z.string(),
  value: z.string(),
  delta: z.string()
});

export const settingsSchema = z.object({
  phone: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  facebook: z.string().url().or(z.literal("")),
  instagram: z.string().url().or(z.literal("")),
  whatsapp: z.string().url().or(z.literal("")),
  tagline: z.string().min(1),
  description: z.string().min(1),
  logo: z.string().optional().nullable().or(z.literal("")),
  bkashNumber: z.string().optional().nullable().or(z.literal("")),
  nagadNumber: z.string().optional().nullable().or(z.literal("")),
  rocketNumber: z.string().optional().nullable().or(z.literal("")),
  pinterest: z.string().optional().nullable().or(z.literal("")),
  youtube: z.string().optional().nullable().or(z.literal("")),
  tiktok: z.string().optional().nullable().or(z.literal("")),
  twitter: z.string().optional().nullable().or(z.literal(""))
});
