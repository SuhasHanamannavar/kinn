// ============================================================
// Edge Function: process-change
// Detects meaningful changes, filters noise,
// calls AI for classification and summarization
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Noise thresholds based on sensitivity setting
const noiseThresholds = {
  conservative: 0.05, // 5% change minimum
  balanced: 0.02,     // 2% change minimum
  aggressive: 0.005,  // 0.5% change minimum
};

function calculateChangeRatio(oldText: string, newText: string): number {
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

function generateSimpleDiff(oldText: string, newText: string): string {
  // Simple line-based diff for evidence
  const oldLines = oldText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const newLines = newText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  
  const oldSet = new Set(oldLines);
  const added = newLines.filter(l => !oldSet.has(l));
  
  return added.slice(0, 10).join('\n');
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('apikey');
  if (authHeader !== SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { url_id, user_id, url, new_hash, old_hash, new_snapshot_id, noise_sensitivity = 'balanced' } = await req.json();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Get previous snapshot for comparison
    const { data: prevSnapshot } = await supabase
      .from('snapshots')
      .select('text_content')
      .eq('url_id', url_id)
      .eq('content_hash', old_hash)
      .order('scraped_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Get new snapshot text
    const { data: newSnapshot } = await supabase
      .from('snapshots')
      .select('text_content')
      .eq('id', new_snapshot_id)
      .maybeSingle();

    const oldText = prevSnapshot?.text_content || '';
    const newText = newSnapshot?.text_content || '';

    // Calculate change ratio and apply noise filter
    const changeRatio = calculateChangeRatio(oldText, newText);
    const threshold = noiseThresholds[noise_sensitivity as keyof typeof noiseThresholds] || 0.02;

    if (changeRatio < threshold) {
      console.log(`Change below threshold (${changeRatio.toFixed(3)} < ${threshold}), filtering as noise`);
      
      // Still update the hash so we don't re-detect this
      await supabase
        .from('monitored_urls')
        .update({ last_content_hash: new_hash })
        .eq('id', url_id);

      return new Response(
        JSON.stringify({ success: true, filtered: true, change_ratio: changeRatio }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate simple diff for AI context
    const rawDiff = generateSimpleDiff(oldText, newText);

    // Call AI for classification and summarization
    const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/ai-summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        url,
        old_text: oldText.substring(0, 5000),
        new_text: newText.substring(0, 5000),
        raw_diff: rawDiff,
        change_ratio: changeRatio,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI summarization failed: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();

    // Extract site name for display
    let site = url;
    try {
      site = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
    } catch {}

    // Create signal
    const { data: signal } = await supabase
      .from('signals')
      .insert({
        url_id,
        user_id,
        snapshot_from_id: prevSnapshot?.id,
        snapshot_to_id: new_snapshot_id,
        category: aiResult.category || 'content',
        category_name: aiResult.category_name || 'New Content',
        importance: aiResult.importance || 'med',
        importance_label: (aiResult.importance || 'med').toUpperCase(),
        site,
        title: aiResult.title || 'Content changed',
        summary: aiResult.summary || 'A change was detected on this page.',
        why_it_matters: aiResult.why_it_matters,
        evidence: aiResult.evidence || [],
        raw_diff: rawDiff.substring(0, 5000),
        ai_summary: aiResult.ai_summary,
      })
      .select()
      .single();

    // Update URL with new hash
    await supabase
      .from('monitored_urls')
      .update({ last_content_hash: new_hash })
      .eq('id', url_id);

    // Check user settings for notification preferences
    const { data: settings } = await supabase
      .from('user_settings')
      .select('email_alerts, only_high_importance')
      .eq('user_id', user_id)
      .maybeSingle();

    const shouldNotify = settings?.email_alerts !== false && 
      (!settings?.only_high_importance || aiResult.importance === 'high');

    if (shouldNotify && signal) {
      // Queue notification
      await fetch(`${SUPABASE_URL}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ signal_id: signal.id, user_id }),
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        signal_created: true,
        signal_id: signal?.id,
        category: aiResult.category,
        importance: aiResult.importance,
        change_ratio: changeRatio,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-change:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
