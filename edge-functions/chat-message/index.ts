// ============================================================
// Edge Function: chat-message
// Handles Kin AI chat interactions with user context
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!;

const CHAT_SYSTEM_PROMPT = `You are Kin, a friendly and intelligent AI monitoring agent. 
You help users understand changes on websites they monitor.

Your personality:
- Concise and helpful
- Friendly but professional
- Action-oriented when appropriate
- Clear about what you know and don't know

You have access to the user's:
- Monitored URLs (watchlist)
- Recent signals (detected changes)
- Signal categories and importance levels

When answering:
1. Reference specific signals and URLs when relevant
2. Prioritize high-importance items
3. Be specific with dates, numbers, and details
4. Suggest actions when appropriate
5. Keep responses focused and scannable

Use markdown formatting for clarity:
- **bold** for emphasis
- Bullet points for lists
- Line breaks between distinct points`;

Deno.serve(async (req) => {
  // This function is called from the client via Supabase RPC or direct HTTP
  // In production, validate the user's JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { user_id, message, context = {} } = await req.json();

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Store user message
    await supabase
      .from('chat_messages')
      .insert({
        user_id,
        role: 'user',
        content: message,
        context,
      });

    // Get recent conversation history (last 10 messages)
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user's signals for context
    const { data: signals } = await supabase
      .from('signals')
      .select('title, summary, category, category_name, importance, site, detected_at, why_it_matters')
      .eq('user_id', user_id)
      .order('detected_at', { ascending: false })
      .limit(15);

    // Get user's watchlist
    const { data: watchlist } = await supabase
      .from('monitored_urls')
      .select('name, url, category, signal_count, last_scan')
      .eq('user_id', user_id)
      .eq('is_active', true)
      .limit(10);

    // Build context string
    const contextParts = [];
    
    if (watchlist && watchlist.length > 0) {
      contextParts.push(`User's monitored URLs (${watchlist.length}):`);
      watchlist.forEach((u, i) => {
        contextParts.push(`${i + 1}. ${u.name} (${u.url}) - ${u.signal_count} signals, last scan: ${u.last_scan || 'never'}`);
      });
    }

    if (signals && signals.length > 0) {
      contextParts.push(`\nRecent signals (${signals.length}):`);
      signals.forEach((s, i) => {
        contextParts.push(`${i + 1}. [${s.category_name.toUpperCase()}/${s.importance.toUpperCase()}] ${s.title}`);
        contextParts.push(`   ${s.summary}`);
        if (s.why_it_matters) {
          contextParts.push(`   Why it matters: ${s.why_it_matters}`);
        }
      });
    }

    const contextStr = contextParts.join('\n');

    // Build messages array for Groq
    const messages = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
    ];

    if (contextStr) {
      messages.push({
        role: 'system',
        content: `User context:\n${contextStr}`,
      });
    }

    // Add conversation history (oldest first)
    if (history) {
      const sortedHistory = [...history].reverse();
      sortedHistory.forEach(msg => {
        messages.push({ role: msg.role, content: msg.content });
      });
    }

    // Call Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages,
        temperature: 0.4,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 
      "I'm sorry, I couldn't process that right now. Please try again.";

    // Store assistant response
    await supabase
      .from('chat_messages')
      .insert({
        user_id,
        role: 'assistant',
        content: aiResponse,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        response: aiResponse,
        model: data.model,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat-message:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
