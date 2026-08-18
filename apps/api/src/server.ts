// Точка входа: запускается прямо из исходников (`node src/server.ts`), сборки нет (Р11).

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { createApp } from './app.ts';
import type { WebBundlePaths } from './app.ts';
import { seedDemoCalendar } from './bootstrap/seed.ts';
import { loadConfig } from './config.ts';
import type { AppConfig } from './config.ts';
import { createMemoryStore } from './store/memory.ts';

// Конвенция размещения бандлов — `apps/client/dist/{guest,owner}`. Путь считается от
// самого файла, а не от `cwd`: локально процесс стартует из `apps/api`, в образе — из
// корня репозитория, и относительный путь разъехался бы между этими запусками.
const WEB_BUNDLES: WebBundlePaths = {
  guestDir: fileURLToPath(new URL('../../client/dist/guest', import.meta.url)),
  ownerDir: fileURLToPath(new URL('../../client/dist/owner', import.meta.url)),
};

let config: AppConfig;
try {
  config = loadConfig();
} catch (error) {
  // Ошибка конфигурации дешевле всего на старте: тихого отката к дефолту нет (Р10).
  const reason = error instanceof Error ? error.message : String(error);
  console.error(`MiniCal API: invalid configuration — ${reason}`);
  process.exit(1);
}

const store = createMemoryStore();
// Без флага хранилище остаётся пустым — поведение по умолчанию не меняется (AC10).
if (config.seedDemo) {
  await seedDemoCalendar(store);
  console.log('MiniCal API: демо-календарь загружен (SEED_DEMO)');
}

// Бандлы собирает образ; в рабочей копии их обычно нет — тогда параметр не передаётся
// и приложение остаётся API-only, как до задачи.
const bundlesPresent = existsSync(WEB_BUNDLES.guestDir) && existsSync(WEB_BUNDLES.ownerDir);
const app = createApp({ config, store }, bundlesPresent ? WEB_BUNDLES : undefined);
if (bundlesPresent) {
  console.log('MiniCal API: web-бандлы раздаются с / (гость) и /admin (владелец)');
}

app.listen(config.port, () => {
  console.log(`MiniCal API: http://localhost:${config.port}/health`);
});
