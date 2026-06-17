// Server-only Gemini REST client. Never import into client components.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function endpoint() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
}

export interface GeminiTurn { role: 'user' | 'model'; text: string; }

interface GenerateOpts {
  system?: string;
  turns: GeminiTurn[];
  json?: boolean;        // request application/json response
  maxRetries?: number;
}

// Returns the model's text reply. Retries 429/5xx with exponential backoff.
export async function geminiGenerate({ system, turns, json, maxRetries = 3 }: GenerateOpts): Promise<string> {
  const body: any = {
    contents: turns.map(t => ({ role: t.role, parts: [{ text: t.text }] })),
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  if (json) body.generationConfig = { responseMimeType: 'application/json' };

  let delay = 800;
  let lastErr: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`Gemini ${res.status}`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== 'string') throw new Error('Gemini: empty response');
      return text;
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw lastErr ?? new Error('Gemini: failed');
}
