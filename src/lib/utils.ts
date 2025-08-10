/**
 * @fileoverview Utility functions library
 * Provides common utility functions for the S-100 WebGIS application
 * @author Development Team
 * @since 2024-01-01
 * @version 1.0.0
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines CSS class names using clsx and tailwind-merge
 * This utility function merges class names efficiently, handling Tailwind CSS conflicts
 * @param {...ClassValue} inputs - Variable number of class values to combine
 * @returns {string} Combined class name string
 * @example
 * ```typescript
 * const className = cn('px-2 py-1', 'bg-blue-500', isActive && 'bg-blue-700');
 * // Returns: 'px-2 py-1 bg-blue-700' (if isActive is true)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
