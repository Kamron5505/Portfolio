// Короткий вызов Gemini для серверных задач (ИИ-отчёт). Модели и ключ те же,
// что у квиза; при перегрузке пробуем запасную модель.

const MODELS = [process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

/** Текст ответа модели или null, если ключа нет или все модели отказали. */
export async function generateText(prompt: string, maxOutputTokens = 900): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const payload = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens },
  });

  for (const model of MODELS) {
    try {
      const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
        body: payload,
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) {
        console.error(`[gemini] ${model}`, res.status, (await res.text().catch(() => '')).slice(0, 200));
        if (RETRYABLE.has(res.status)) continue;
        return null;
      }
      const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim();
      if (text) return text;
    } catch (error) {
      console.error(`[gemini] ${model} не ответил:`, error);
    }
  }
  return null;
}
