// Form validation schemas using Zod
import { z } from 'zod';

// Checkout form schema
export const CheckoutFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  address: z.string().optional(),
  notes: z.string().optional(),
  deliveryMethod: z.enum(['pickup', 'delivery']),
  paymentMethod: z.string().min(1, 'Selecciona un método de pago'),
});

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;

// Add to cart form schema
export const AddToCartSchema = z.object({
  productId: z.string().or(z.number()),
  quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
  size: z.string().optional(),
  color: z.string().optional(),
});

export type AddToCartData = z.infer<typeof AddToCartSchema>;

// Contact form schema
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(3, 'El asunto debe tener al menos 3 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// Product filter schema
export const ProductFilterSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStock: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest']).optional(),
});

export type ProductFilterData = z.infer<typeof ProductFilterSchema>;
