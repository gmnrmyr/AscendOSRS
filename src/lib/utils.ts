import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID único que funciona em QUALQUER contexto. crypto.randomUUID() só existe em
// secure context (HTTPS ou localhost) — pela LAN via http://IP ele é undefined e
// quebrava o "adicionar" (char/item/method/goal). Este fallback nunca quebra.
export function uid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID()
    }
  } catch { /* contexto não-seguro: cai pro fallback */ }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function parseGoldInput(input: string): number {
  if (!input) return 0;
  
  // Remove all spaces and convert to lowercase
  const cleanInput = input.replace(/\s+/g, '').toLowerCase();
  
  // Match number followed by optional k/m/b
  const match = cleanInput.match(/^(\d+\.?\d*)(k|m|b)?$/);
  if (!match) return 0;
  
  const [, numStr, suffix] = match;
  const num = parseFloat(numStr);
  
  if (isNaN(num)) return 0;
  
  switch (suffix) {
    case 'k': return num * 1000;
    case 'm': return num * 1000000;
    case 'b': return num * 1000000000;
    default: return num;
  }
}

export function formatGoldValue(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}b`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}m`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toString();
}
