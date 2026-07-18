// Хук Next.js: выполняется один раз при старте сервера.
// Здесь поднимаем WebSocket-сервер живого чата (см. src/server/chat-server.ts).
// На edge-рантайме (middleware) и в браузере ничего не делаем.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startChatServer } = await import('./server/chat-server');
    await startChatServer();
  }
}
