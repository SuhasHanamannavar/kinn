import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey: GROQ_API_KEY });

const PRIMARY_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'qwen/qwen3.6-27b';

export interface AIClassificationResult {
  category: 'content' | 'pricing' | 'policy' | 'feature' | 'announce' | 'deadline';
  category_name: string;
  importance: 'high' | 'med' | 'low';
  title: string;
  summary: string;
  why_it_matters: string;
  evidence: { label: string; value: string }[];
  ai_summary?: string;
}

const SYSTEM_PROMPT = `You are Kin, an AI monitoring agent. Your job is to analyze website changes and produce clear, actionable intelligence.

Given the old and new text content of a page, identify what changed and output a JSON object with these exact fields:

{
  "category": "content|pricing|policy|feature|announce|deadline",
  "category_name": "Human readable category name",
  "importance": "high|med|low",
  "title": "Short, specific title for the change (max 80 chars)",
  "summary": "1-2 sentences explaining what changed in plain English",
  "why_it_matters": "1 sentence explaining why this matters to the user",
  "evidence": [{"label": "What changed", "value": "specific detail"}]
}

Classification guidelines:
- deadline: dates, deadlines, timelines changed
- pricing: costs, prices, plans, billing changed
- policy: terms, rules, policies, regulations updated
- feature: new features, capabilities, functionality added
- announce: announcements, news, roadmaps
- content: new articles, posts, general content

Importance guidelines:
- high: Directly impacts user's goals, deadlines, costs, or compliance
- med: Interesting and relevant but not urgent
- low: Minor changes, cosmetic updates, low relevance

Be concise, specific, and actionable. Always output valid JSON only.`;

export async function analyzeChangeWithAI(params: {
  url: string;
  oldText: string;
  newText: string;
  rawDiff: string;
  changeRatio: number;
}): Promise<AIClassificationResult> {
  const { url, oldText, newText, rawDiff, changeRatio } = params;

  const userPrompt = `Analyze the changes on this page: ${url}

Change ratio: ${(changeRatio * 100).toFixed(1)}% of content changed.

Key differences detected:
${rawDiff || '(see text excerpts)'}

OLD content excerpt:
${oldText.substring(0, 2500)}

---

NEW content excerpt:
${newText.substring(0, 2500)}

---

Classify this change and output the JSON response.`;

  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL, 'openai/gpt-oss-20b'];

  for (const model of modelsToTry) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);

      return {
        category: parsed.category || 'content',
        category_name: parsed.category_name || 'Content Update',
        importance: parsed.importance || 'med',
        title: parsed.title || 'Page content updated',
        summary: parsed.summary || 'A change was detected on the monitored website.',
        why_it_matters: parsed.why_it_matters || 'Review the page to see the latest updates.',
        evidence: Array.isArray(parsed.evidence) ? parsed.evidence : [],
        ai_summary: content,
      };
    } catch (err) {
      console.warn(`Groq model ${model} failed, trying next...`, err);
    }
  }

  // Fallback if all AI models fail
  return {
    category: 'content',
    category_name: 'Content Update',
    importance: 'med',
    title: 'Website content updated',
    summary: `Content changes were detected on ${url}.`,
    why_it_matters: 'The page text was modified since the last scan.',
    evidence: rawDiff ? [{ label: 'Diff snippet', value: rawDiff.substring(0, 100) }] : [],
  };
}

const CHAT_SYSTEM_PROMPT = `You are Kin, a friendly and intelligent AI monitoring agent (represented as a cute penguin mascot).
You help users understand changes on websites they monitor.

Your personality:
- Concise, sharp, and helpful
- Friendly and observant
- Action-oriented and proactive
- Always grounded in the user's monitored watchlist and signals

When answering:
1. Reference specific signals and URLs from the user's watchlist when relevant
2. Prioritize high-importance items (deadlines, pricing changes, policy updates)
3. Be specific with numbers, names, and details
4. Suggest actions when appropriate
5. Keep responses clean, focused, and scannable using Markdown (bold, bullet points)`;

export async function chatWithKinAI(params: {
  message: string;
  watchlistContext?: any[];
  signalsContext?: any[];
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}): Promise<string> {
  const { message, watchlistContext = [], signalsContext = [], conversationHistory = [] } = params;

  const contextParts = [];

  if (watchlistContext.length > 0) {
    contextParts.push(`User's Monitored URLs (${watchlistContext.length}):`);
    watchlistContext.forEach((u, i) => {
      contextParts.push(`${i + 1}. ${u.name || u.url} (${u.url}) - Status: ${u.status || 'watching'}, Signals: ${u.signal_count || 0}, Last scan: ${u.last_scan || 'recently'}`);
    });
  }

  if (signalsContext.length > 0) {
    contextParts.push(`\nRecent Detected Signals (${signalsContext.length}):`);
    signalsContext.forEach((s, i) => {
      contextParts.push(`${i + 1}. [${(s.category_name || s.category || 'SIGNAL').toUpperCase()} / ${(s.importance || 'MED').toUpperCase()}] ${s.title}`);
      contextParts.push(`   Site: ${s.site || 'Site'} | Detected: ${s.detected_at || 'recent'}`);
      contextParts.push(`   Summary: ${s.summary}`);
      if (s.why_it_matters) {
        contextParts.push(`   Why it matters: ${s.why_it_matters}`);
      }
    });
  }

  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
  ];

  if (contextParts.length > 0) {
    messages.push({
      role: 'system',
      content: `Live Workspace Intelligence Context:\n${contextParts.join('\n')}`,
    });
  }

  // Add past conversation turns (up to 8)
  const recentHistory = conversationHistory.slice(-8);
  for (const turn of recentHistory) {
    messages.push({ role: turn.role, content: turn.content });
  }

  messages.push({ role: 'user', content: message });

  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL, 'openai/gpt-oss-20b'];

  for (const model of modelsToTry) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.4,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || "I couldn't generate a response right now. Please ask me again!";
    } catch (err) {
      console.warn(`Groq chat model ${model} failed, trying fallback:`, err);
    }
  }

  return "I'm having a little trouble connecting to my neural core right now, but I'm still actively watching your websites!";
}
