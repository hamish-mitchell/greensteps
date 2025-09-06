/**
 * Shadcn/UI Utility - Class Name Management
 * 
 * Combines clsx and tailwind-merge for intelligent class name merging.
 * Used throughout the UI components for conditional styling.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
