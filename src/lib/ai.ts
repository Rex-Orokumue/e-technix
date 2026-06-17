// Server-only Groq (OpenAI-compatible) client. Never import into client components.
// Groq has a genuinely free API tier (no billing required). Get a key at
// https://console.groq.com and set GROQ_API_KEY in the server env.
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function apiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set');
  return key;
}

export interface AiTurn { role: 'user' | 'model'; text: string; }

interface GenerateOpts {
  system?: string;
  turns: AiTurn[];
  json?: boolean;        // request a JSON object response
  maxRetries?: number;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Returns the model's text reply. Retries 5xx with backoff; fails fast on 429.
export async function aiGenerate({ system, turns, json, maxRetries = 2 }: GenerateOpts): Promise<string> {
  const messages: { role: string; content: string }[] = [];
  if (system) messages.push({ role: 'system', content: system });
  for (const t of turns) messages.push({ role: t.role === 'model' ? 'assistant' : 'user', content: t.text });

  const body: any = { model: MODEL, messages };
  if (json) body.response_format = { type: 'json_object' };

  let delay = 800;
  let lastErr: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey()}` },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        // Rate/quota limit — retrying immediately just burns more, so fail fast.
        const detail = await res.text().catch(() => '');
        throw new Error(`AI 429: ${detail.slice(0, 900)}`);
      }
      if (res.status >= 500) {
        const detail = await res.text().catch(() => '');
        lastErr = new Error(`AI ${res.status}: ${detail.slice(0, 300)}`);
        await sleep(delay); delay *= 2; continue;
      }
      if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 400)}`);
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== 'string') throw new Error('AI: empty response');
      return text;
    } catch (e: any) {
      if (String(e?.message ?? e).startsWith('AI 429')) throw e;
      lastErr = e;
      await sleep(delay); delay *= 2;
    }
  }
  throw lastErr ?? new Error('AI: failed');
}
