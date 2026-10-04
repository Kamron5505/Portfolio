// Отправка сообщений владельцу сайта в Telegram (тот же бот, что у квиза).

export const escapeHtml = (s: string) =>
  s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!);

const LIMIT = 3800; // у Telegram 4096, оставляем запас под разметку

/** Режет длинный текст по строкам на куски, которые пролезут в одно сообщение. */
function split(text: string): string[] {
  const parts: string[] = [];
  let current = '';
  for (const line of text.split('\n')) {
    if ((current + '\n' + line).length > LIMIT && current) {
      parts.push(current);
      current = line;
    } else {
      current = current ? `${current}\n${line}` : line;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/** HTML-сообщение владельцу. Возвращает false, если бот не настроен или Telegram отказал. */
export async function sendToOwner(html: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  for (const chunk of split(html)) {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: chunk, parse_mode: 'HTML', disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error('[telegram] sendMessage', res.status, (await res.text().catch(() => '')).slice(0, 200));
      return false;
    }
  }
  return true;
}
