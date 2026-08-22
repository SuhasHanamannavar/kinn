import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/$/, '');
  } catch {
    return url;
  }
}

export function getSiteName(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function categoryColorClasses(category: string): string {
  const map: Record<string, string> = {
    content: 'bg-[rgba(8,145,178,0.08)] text-[#0E7490] border-[rgba(8,145,178,0.15)]',
    pricing: 'bg-[rgba(217,119,6,0.08)] text-[#92400E] border-[rgba(217,119,6,0.15)]',
    policy: 'bg-[rgba(124,58,237,0.08)] text-[#5B21B6] border-[rgba(124,58,237,0.15)]',
    feature: 'bg-[rgba(5,150,105,0.08)] text-[#065F46] border-[rgba(5,150,105,0.15)]',
    announce: 'bg-[rgba(190,24,93,0.08)] text-[#9D174D] border-[rgba(190,24,93,0.15)]',
    deadline: 'bg-[rgba(220,38,38,0.08)] text-[#991B1B] border-[rgba(220,38,38,0.15)]',
  };
  return map[category] || map.content;
}

export function importanceColorClasses(level: string): string {
  const map: Record<string, string> = {
    high: 'text-[#DC2626] font-bold',
    med: 'text-[#D97706] font-semibold',
    low: 'text-[#6B7280] font-medium',
  };
  return map[level] || map.low;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
