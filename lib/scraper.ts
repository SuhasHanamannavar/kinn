import crypto from 'crypto';

const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || '';
const BRIGHTDATA_CUSTOMER_ID = process.env.BRIGHTDATA_CUSTOMER_ID || '';

export function cleanHtml(html: string): { text: string; cleanedHtml: string } {
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/data-[a-z-]+="[^"]*"/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/csrf[_-]?token["'][^>]*>/gi, '')
    .replace(/session[_-]?id["'][^>]*>/gi, '')
    .replace(/\b(?:timestamp|ts|_t|cacheBuster)=[^&\s]+/gi, '');

  const text = cleaned
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { text, cleanedHtml: cleaned };
}

export function sha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function calculateChangeRatio(oldText: string, newText: string): number {
  if (!oldText || !newText) return 1;
  const oldWords = new Set(oldText.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const newWords = new Set(newText.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (oldWords.size === 0) return 1;
  
  let changed = 0;
  for (const word of newWords) {
    if (!oldWords.has(word)) changed++;
  }
  return changed / Math.max(oldWords.size, newWords.size);
}

export function generateSimpleDiff(oldText: string, newText: string): string {
  const oldLines = oldText.split(/[.!?\n]+/).map(s => s.trim()).filter(Boolean);
  const newLines = newText.split(/[.!?\n]+/).map(s => s.trim()).filter(Boolean);
  const oldSet = new Set(oldLines);
  const added = newLines.filter(l => !oldSet.has(l));
  return added.slice(0, 15).join('\n');
}

export async function fetchPageContent(url: string): Promise<{ html: string; text: string; hash: string }> {
  const targetUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  
  // Try BrightData Web Unlocker first
  try {
    const brightDataUrl = 'https://api.brightdata.com/request';
    const response = await fetch(brightDataUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zone: 'cli_unlocker',
        url: targetUrl,
        format: 'raw',
      }),
    });

    if (response.ok) {
      const html = await response.text();
      const { text, cleanedHtml } = cleanHtml(html);
      const hash = sha256(text);
      return { html: cleanedHtml, text, hash };
    }
    console.warn(`BrightData request returned status ${response.status}, falling back to standard fetch`);
  } catch (err) {
    console.warn('BrightData request error, falling back to direct fetch:', err);
  }

  // Fallback to standard fetch
  const directRes = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 KinMonitoring/1.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!directRes.ok) {
    throw new Error(`Failed to fetch page: ${directRes.status} ${directRes.statusText}`);
  }

  const html = await directRes.text();
  const { text, cleanedHtml } = cleanHtml(html);
  const hash = sha256(text);
  return { html: cleanedHtml, text, hash };
}
