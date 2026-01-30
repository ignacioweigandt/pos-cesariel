/**
 * Combinar clases CSS con clsx y tailwind-merge.
 * Previene conflictos de clases Tailwind.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
