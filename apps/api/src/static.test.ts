// Раздача web-бандлов проверяется на временных fixture-каталогах, а не на настоящем
// экспорте клиента: в рабочей копии бандлов нет, а гейт зоны обязан быть
// самодостаточным. Форма ответов вне контракта здесь та же, что в api.test.ts, —
// проверяется именно то, что статика её не сломала.

import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { createApp } from './app.ts';
import type { WebBundlePaths } from './app.ts';
import type { AppConfig } from './config.ts';
import { createMemoryStore } from './store/memory.ts';

const CONFIG: AppConfig = { port: 0, publicWebUrl: 'http://localhost:8081', seedDemo: false };

const GUEST_HTML = '<!doctype html><title>MiniCal — гость</title>';
const OWNER_HTML = '<!doctype html><title>MiniCal — владелец</title>';

type Send = (path: string, init?: RequestInit) => Promise<Response>;

/** Каталог ассетов называется `_expo/` — так его кладёт экспорт клиента. */
async function writeBundles(root: string): Promise<WebBundlePaths> {
  const paths: WebBundlePaths = { guestDir: join(root, 'guest'), ownerDir: join(root, 'owner') };
  for (const [dir, html, marker] of [
    [paths.guestDir, GUEST_HTML, 'guest'],
    [paths.ownerDir, OWNER_HTML, 'owner'],
  ] as const) {
    await mkdir(join(dir, '_expo'), { recursive: true });
    await writeFile(join(dir, 'index.html'), html);
    await writeFile(join(dir, '_expo', 'bundle.js'), `console.log('${marker}');`);
  }
  return paths;
}

async function withServer(
  run: (send: Send) => Promise<void>,
  options: { bundles: boolean },
): Promise<void> {
  const root = options.bundles ? await mkdtemp(join(tmpdir(), 'minical-bundles-')) : null;
  const bundles = root === null ? undefined : await writeBundles(root);
  const server = createApp({ config: CONFIG, store: createMemoryStore() }, bundles).listen(0);
  await once(server, 'listening');

  const address = server.address();
  assert.ok(address !== null && typeof address === 'object', 'server is listening on a TCP port');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // redirect: 'manual' — иначе 301 на `/admin/` был бы пройден незаметно.
    await run((path, init = {}) => fetch(`${baseUrl}${path}`, { redirect: 'manual', ...init }));
  } finally {
    server.close();
    await once(server, 'close');
    if (root !== null) await rm(root, { recursive: true, force: true });
  }
}

test('GET / отдаёт гостевой бандл, GET /admin/ — владельческий (AC3)', async () => {
  await withServer(
    async (send) => {
      const guest = await send('/');
      assert.equal(guest.status, 200);
      assert.ok(guest.headers.get('content-type')?.startsWith('text/html'));
      assert.equal(await guest.text(), GUEST_HTML);

      const owner = await send('/admin/');
      assert.equal(owner.status, 200);
      assert.ok(owner.headers.get('content-type')?.startsWith('text/html'));
      assert.equal(await owner.text(), OWNER_HTML);
    },
    { bundles: true },
  );
});

test('ассеты бандлов не смешиваются: /_expo — гостевой, /admin/_expo — владельческий', async () => {
  await withServer(
    async (send) => {
      assert.match(await (await send('/_expo/bundle.js')).text(), /guest/);
      assert.match(await (await send('/admin/_expo/bundle.js')).text(), /owner/);
    },
    { bundles: true },
  );
});

test('GET /admin без завершающего слэша — штатный 301 serve-static на /admin/', async () => {
  await withServer(
    async (send) => {
      const response = await send('/admin');
      assert.equal(response.status, 301);
      const location = new URL(response.headers.get('location') ?? '', 'http://127.0.0.1');
      assert.equal(location.pathname, '/admin/');
    },
    { bundles: true },
  );
});

test('операции контракта не затенены статикой, включая общий префикс /admin', async () => {
  await withServer(
    async (send) => {
      // До онбординга операция отвечает доменной ошибкой — значит, запрос дошёл до
      // обработчика, а не до index.html владельческого бандла.
      const settings = await send('/admin/settings');
      assert.equal(settings.status, 400);
      assert.equal((await settings.json()).code, 'CALENDAR_NOT_CONFIGURED');

      const health = await send('/health');
      assert.equal(health.status, 200);
      assert.deepEqual(await health.json(), { status: 'ok' });
    },
    { bundles: true },
  );
});

test('запрос без файла проваливается сквозь статику и получает прежний JSON-404 (G3)', async () => {
  await withServer(
    async (send) => {
      // POST /admin и POST /health — не-GET: serve-static их не обслуживает вовсе.
      for (const [method, path] of [
        ['GET', '/nope'],
        ['GET', '/admin/nope'],
        ['POST', '/health'],
        ['POST', '/admin'],
      ] as const) {
        const response = await send(path, { method });
        assert.equal(response.status, 404, `${method} ${path}`);
        const body = await response.json();
        assert.deepEqual(Object.keys(body).sort(), ['code', 'message'], `${method} ${path}`);
        assert.equal(body.code, 'NOT_FOUND');
      }
    },
    { bundles: true },
  );
});

test('без каталогов бандлов приложение остаётся API-only', async () => {
  await withServer(
    async (send) => {
      for (const path of ['/', '/admin/']) {
        const response = await send(path);
        assert.equal(response.status, 404, path);
        assert.equal((await response.json()).code, 'NOT_FOUND');
      }
      assert.equal((await send('/health')).status, 200);
    },
    { bundles: false },
  );
});
