import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getGradientByMood(sentiment: number): string {
  const gradients = [
    'from-red-500 to-orange-500',      // Very Bearish
    'from-orange-500 to-yellow-500',   // Bearish
    'from-yellow-500 to-blue-500',     // Neutral
    'from-blue-500 to-green-500',      // Bullish
    'from-green-500 to-emerald-500',   // Very Bullish
  ];
  return gradients[Math.max(0, Math.min(4, sentiment - 1))];
}
