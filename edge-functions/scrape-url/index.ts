// ============================================================
// Edge Function: scrape-url
// Calls BrightData Web Unlocker to fetch page content
// Stores snapshot and passes to change detection
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BRIGHTDATA_API_KEY = Deno.env.get('BRIGHTDATA_API_KEY')!;
const BRIGHTDATA_CUSTOMER_ID = Deno.env.get('BRIGHTDATA_CUSTOMER_ID')!;

async function fetchWithBrightData(url: string): Promise<{ html: string; status: number }> {
  // BrightData Web Unlocker API
  const brightDataUrl = `https://api.brightdata.com/request?customer=${BRIGHTDATA_CUSTOMER_ID}&zone=web_unlocker`;
  
  const response = await fetch(brightDataUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BRIGHTDATA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url,
      format: 'raw',
      render_js: true,
      country: 'us',
      timeout: 60000,
    }),
  });

  if (!response.ok) {
    throw new Error(`BrightData API error: ${response.status}`);
  }

  const html = await response.text();
  return { html, status: response.status };
}

function cleanHtml(html: string): { text: string; cleanedHtml: string } {
  // Remove scripts, styles, and other noise
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/data-[a-z-]+="[^"]*"/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove common dynamic noise patterns
    .replace(/csrf[_-]?token["'][^>]*>/gi, '')
    .replace(/session[_-]?id["'][^>]*>/gi, '')
    .replace(/\b(?:timestamp|ts|_t|cacheBuster)=[^&\s]+/gi, '');

  // Extract text content
  const text = cleaned
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { text, cleanedHtml: cleaned };
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('apikey');
  if (authHeader !== SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const urlData = await req.json();
  const { id: url_id, url, user_id, noise_sensitivity, last_content_hash } = urlData;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Update status to scanning
    await supabase
      .from('monitored_urls')
      .update({ status: 'scanning' })
      .eq('id', url_id);

    // Fetch via BrightData
    console.log(`Scraping: ${url}`);
    const { html, status } = await fetchWithBrightData(url);
    
    // Clean and hash
    const { text, cleanedHtml } = cleanHtml(html);
    const contentHash = await sha256(text);

    // Store snapshot
    const { data: snapshot } = await supabase
      .from('snapshots')
      .insert({
        url_id,
        user_id,
        content_hash: contentHash,
        raw_html: cleanedHtml.substring(0, 500000), // Limit size
        text_content: text.substring(0, 100000),
        status: 'success',
      })
      .select()
      .single();

    // Update URL status and last scan
    await supabase
      .from('monitored_urls')
      .update({ 
        status: 'watching',
        last_scan: new Date().toISOString(),
      })
      .eq('id', url_id);

    // Check if content changed
    if (last_content_hash && last_content_hash !== contentHash) {
      console.log(`Content changed for ${url}`);
      
      // Call process-change to analyze the difference
      await fetch(`${SUPABASE_URL}/functions/v1/process-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          url_id,
          user_id,
          url,
          new_hash: contentHash,
          old_hash: last_content_hash,
          new_snapshot_id: snapshot?.id,
          noise_sensitivity,
        }),
      });
    } else if (!last_content_hash) {
      // First scan - just store the hash for next time
      await supabase
        .from('monitored_urls')
        .update({ last_content_hash: contentHash })
        .eq('id', url_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        url_id, 
        content_changed: last_content_hash !== contentHash,
        status 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    
    // Update status to error
    await supabase
      .from('monitored_urls')
      .update({ 
        status: 'error',
        last_scan: new Date().toISOString(),
      })
      .eq('id', url_id);

    // Store error snapshot
    await supabase
      .from('snapshots')
      .insert({
        url_id,
        user_id,
        content_hash: 'error',
        status: 'error',
        error_message: String(error),
      });

    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
