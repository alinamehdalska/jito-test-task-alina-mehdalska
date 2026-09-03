import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Compose Tailwind classes; later classes win on conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
