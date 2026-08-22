// ============================================================
// Edge Function: ai-summarize
// Calls Groq API (Llama 3) to classify, summarize,
// and explain the importance of detected changes
// ============================================================

const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!;

const SYSTEM_PROMPT = `You are Kin, an AI monitoring agent. Your job is to analyze website changes and produce clear, actionable intelligence.

Given the old and new text content of a page, identify what changed and output a JSON object with these fields:

{
  "category": "content|pricing|policy|feature|announce|deadline",
  "category_name": "Human readable category name",
  "importance": "high|med|low",
  "title": "Short, specific title for the change (max 80 chars)",
  "summary": "1-2 sentences explaining what changed in plain English",
  "why_it_matters": "1 sentence explaining why this matters to the user",
  "evidence": [{"label": "What changed", "value": "specific detail"}, ...]
}

Classification guidelines:
- deadline: dates, deadlines, timelines changed
- pricing: costs, prices, plans, billing changed
- policy: terms, rules, policies, regulations updated
- feature: new features, capabilities, functionality added
- announce: announcements, news, roadmaps
- content: new articles, courses, posts, general content

Importance guidelines:
- high: Directly impacts user's goals, deadlines, costs, or compliance
- med: Interesting and relevant but not urgent
- low: Minor changes, cosmetic updates, low relevance

Be concise, specific, and actionable. Always output valid JSON only.`;

Deno.serve(async (req) => {
  const authHeader = req.headers.get('apikey');
  if (authHeader !== SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { url, old_text, new_text, raw_diff, change_ratio } = await req.json();

  try {
    const userPrompt = `Analyze the changes on this page: ${url}

Change ratio: ${(change_ratio * 100).toFixed(1)}% of content changed.

Key differences detected:
${raw_diff || '(see full text comparison)'}

OLD content (excerpt):
${old_text.substring(0, 2000)}

---

NEW content (excerpt):
${new_text.substring(0, 2000)}

---

Classify this change and output the JSON response.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0]?.message?.content || '{}';
    
    let result;
    try {
      result = JSON.parse(aiContent);
    } catch {
      // Fallback if JSON parsing fails
      result = {
        category: 'content',
        category_name: 'Content Change',
        importance: 'med',
        title: 'Content updated on page',
        summary: aiContent.substring(0, 200),
        why_it_matters: 'A change was detected that may be relevant.',
        evidence: [],
      };
    }

    // Add raw AI summary for reference
    result.ai_summary = aiContent;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-summarize:', error);
    
    // Fallback response so pipeline can continue
    const fallback = {
      category: 'content',
      category_name: 'Content Change',
      importance: 'med',
      title: 'Content changed on monitored page',
      summary: `A change was detected on ${url}. The content has been updated.`,
      why_it_matters: 'Review the page to see what changed.',
      evidence: [],
      ai_summary: null,
      error: String(error),
    };

    return new Response(JSON.stringify(fallback), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
