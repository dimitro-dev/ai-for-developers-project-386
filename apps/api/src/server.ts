// Точка входа: запускается прямо из исходников (`node src/server.ts`), сборки нет (Р11).

import { createApp } from './app.ts';
import { loadConfig } from './config.ts';
import type { AppConfig } from './config.ts';
import { createMemoryStore } from './store/memory.ts';

let config: AppConfig;
try {
  config = loadConfig();
} catch (error) {
  // Ошибка конфигурации дешевле всего на старте: тихого отката к дефолту нет (Р10).
  const reason = error instanceof Error ? error.message : String(error);
  console.error(`MiniCal API: invalid configuration — ${reason}`);
  process.exit(1);
}

const app = createApp({ config, store: createMemoryStore() });

app.listen(config.port, () => {
  console.log(`MiniCal API: http://localhost:${config.port}/health`);
});
