/**
 * Shadcn/UI Utils - Advanced Class Management
 * 
 * Extended utility functions for shadcn/ui components.
 * Provides enhanced class name merging and style composition.
 */
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
