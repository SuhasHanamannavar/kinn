// ============================================================
// Edge Function: trigger-scraping
// Triggered by pg_cron on a schedule (daily/12h/hourly)
// Finds all URLs due for scanning and queues scrape jobs
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Verify this is an internal call from pg_cron
  const authHeader = req.headers.get('apikey');
  if (authHeader !== SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { frequency = 'daily' } = await req.json();
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Find URLs due for scanning based on frequency
    const { data: urls, error } = await supabase
      .from('monitored_urls')
      .select('id, url, normalized_url, user_id, noise_sensitivity, last_content_hash')
      .eq('is_active', true)
      .eq('status', 'watching')
      .eq('scan_frequency', frequency);

    if (error) throw error;

    console.log(`Found ${urls?.length || 0} URLs to scan for frequency: ${frequency}`);

    // Queue each URL for scraping by calling scrape-url edge function
    const results = [];
    
    for (const url of urls || []) {
      try {
        // Call scrape-url function
        const scrapeResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/scrape-url`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify(url),
          }
        );
        
        results.push({
          url_id: url.id,
          status: scrapeResponse.status,
        });
      } catch (err) {
        results.push({
          url_id: url.id,
          error: String(err),
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        frequency, 
        queued: urls?.length || 0,
        results 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in trigger-scraping:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
