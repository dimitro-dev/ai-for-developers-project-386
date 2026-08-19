// Окружение приходит параметром — тесты не трогают process.env и не зависят от
// того, что задано в оболочке разработчика.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { loadConfig } from './config.ts';

test('дефолты: пустое окружение даёт порт 3001, локальный publicUrl и выключенный сид', () => {
  assert.deepEqual(loadConfig({}), {
    port: 3001,
    publicWebUrl: 'http://localhost:8081',
    seedDemo: false,
  });
});

test('PORT: целое из диапазона принимается, мусор — отказ старта', () => {
  assert.equal(loadConfig({ PORT: '8080' }).port, 8080);
  assert.equal(loadConfig({ PORT: '' }).port, 3001);
  // Обрамляющие пробелы платформы добавляют сами — значение остаётся тем же числом.
  assert.equal(loadConfig({ PORT: ' 3001' }).port, 3001);

  for (const raw of ['abc', '0', '65536', '3001.5']) {
    assert.throws(() => loadConfig({ PORT: raw }), /PORT/, `PORT="${raw}" обязан отказать`);
  }
});

test('PORT: числовые формы, которые Number() молча принял бы за другое число', () => {
  // `0x10` дал бы 16, `1e3` — 1000, `+3001` прошёл бы как 3001: слушали бы не тот порт,
  // который задан в окружении, и разошлось бы это только на проде.
  for (const raw of ['0x10', '1e3', '+3001']) {
    assert.throws(() => loadConfig({ PORT: raw }), /PORT/, `PORT="${raw}" обязан отказать`);
  }
});

test('PUBLIC_WEB_URL: абсолютный http(s) принимается, прочее — отказ старта', () => {
  assert.equal(
    loadConfig({ PUBLIC_WEB_URL: 'https://minical.example' }).publicWebUrl,
    'https://minical.example',
  );
  assert.equal(loadConfig({ PUBLIC_WEB_URL: '' }).publicWebUrl, 'http://localhost:8081');

  for (const raw of ['minical.example', '/calendar', 'ftp://minical.example']) {
    assert.throws(
      () => loadConfig({ PUBLIC_WEB_URL: raw }),
      /PUBLIC_WEB_URL/,
      `PUBLIC_WEB_URL="${raw}" обязан отказать`,
    );
  }
});

test('SEED_DEMO (AC10): без переменной и на выключающих значениях сид выключен', () => {
  for (const raw of ['', '0', 'false']) {
    assert.equal(loadConfig({ SEED_DEMO: raw }).seedDemo, false, `SEED_DEMO="${raw}"`);
  }
});

test('SEED_DEMO: включается значениями "1" и "true"', () => {
  for (const raw of ['1', 'true']) {
    assert.equal(loadConfig({ SEED_DEMO: raw }).seedDemo, true, `SEED_DEMO="${raw}"`);
  }
});

test('SEED_DEMO: мусорное значение — отказ старта, а не тихое выключение', () => {
  for (const raw of ['yes', 'on', 'True', '2']) {
    assert.throws(() => loadConfig({ SEED_DEMO: raw }), /SEED_DEMO/, `SEED_DEMO="${raw}"`);
  }
});
