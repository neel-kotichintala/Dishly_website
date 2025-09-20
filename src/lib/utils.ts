import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a deterministic placeholder image based on a name
export function generateImageFromName(name: string, options?: { width?: number; height?: number }) {
  const width = options?.width ?? 800;
  const height = options?.height ?? 600;
  const seed = encodeURIComponent(name.trim().toLowerCase());

  // Use picsum with seed for determinism and a subtle overlayed text for context
  // Example: https://picsum.photos/seed/<seed>/<w>/<h>
  // Avoid text overlay services to keep it simple and offline-friendly CDN
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}
