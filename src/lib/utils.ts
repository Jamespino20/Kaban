import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Serializes Prisma Decimal objects to numbers for Client Component compatibility
 * Next.js 15/React 19 doesn't allow passing non-plain objects like Decimals.
 */
export function serializeDecimal<T>(data: T): any {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => serializeDecimal(item));
  }
  
  // Detect Prisma Decimal (Decimal.js-like objects)
  // We check for presence of d, s, e and avoid truthiness checks as e can be 0.
  if (
    typeof data === 'object' && 
    data !== null &&
    'd' in data && 
    's' in data && 
    'e' in data &&
    typeof (data as any).toString === 'function'
  ) {
    const val = (data as any).toString();
    const num = Number(val);
    return isNaN(num) ? val : num;
  }
  
  if (typeof data === 'object' && data !== null) {
    // If it's a Date, keep it as Date or string? 
    // Next.js 15 allows Dates in some contexts, but usually they should be serialized.
    if (data instanceof Date) return data;

    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Only serialize non-function properties to prevent "Objects with toJSON methods" error
      if (typeof value !== 'function') {
        serialized[key] = serializeDecimal(value);
      }
    }
    return serialized;
  }
  
  return data;
}
