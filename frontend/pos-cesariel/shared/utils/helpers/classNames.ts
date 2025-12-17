/**
 * ClassName utilities
 *
 * Utility for combining CSS classes with Tailwind CSS support
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine classes using clsx and tailwind-merge
 * Prevents Tailwind class conflicts
 * @param inputs - Class values to combine
 * @returns Combined class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
