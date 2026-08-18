### Hexlet tests and linter status:
[![Actions Status](https://github.com/dimitro-dev/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/dimitro-dev/ai-for-developers-project-386/actions)

# MiniCal

Учебный сервис бронирования без регистрации и авторизации: владелец календаря настраивает расписание и типы событий, гость бронирует свободный слот. Подробности — в [`AGENTS.md`](AGENTS.md) и [`docs/architecture.md`](docs/architecture.md).

## Требования к окружению

- Node.js 26 (файл [`.nvmrc`](.nvmrc); поддерживается `>=24`) и npm 11+
- Git
- Для Android debug-сборки клиента: Android SDK и JDK 17 на хосте
- Docker — для локального контура PostgreSQL (раздел «Запуск» → PostgreSQL). На macOS/arm64 провайдер — colima + docker CLI + Compose plugin через Homebrew:

```bash
brew install colima docker docker-compose
```

**Обязательный шаг после установки** — без него `docker compose` не находится («docker: 'compose' is not a docker command»): добавить в `~/.docker/config.json`

```json
{
  "cliPluginsExtraDirs": [
    "/opt/homebrew/lib/docker/cli-plugins"
  ]
}
```

Запуск VM с явно заданными ресурсами:

```bash
colima start --cpu 4 --memory 4 --disk 20
```

Проверка установки:

```bash
docker version
docker compose version
colima status
```

Версии, проверенные 2026-08-16 на этой машине: colima 0.10.3, docker CLI 29.7.2, Docker Compose 5.4.0, Docker Engine (в VM) 29.5.2, образ `postgres:18`.

Docker нужен только для контура базы: обязательный набор проверок и запуск API/клиента из исходников от Docker не зависят и работают на машине без него.

## Установка

```bash
npm ci
```

Одна команда восстанавливает все workspaces из `package-lock.json`, включая локальные TypeSpec compiler и codegen. Глобальная установка TypeSpec CLI не нужна.

## Команды

| Команда | Назначение |
|---|---|
| `npm run contracts:format` | Форматирование TypeSpec-исходников контракта |
| `npm run contracts:format:check` | Проверка форматирования без изменения файлов |
| `npm run contracts:build` | Компиляция TypeSpec → `packages/contracts/generated/openapi.yaml` |
| `npm run generate` | Полная цепочка: TypeSpec → OpenAPI 3.0 → frontend SDK → backend types + Zod |
| `npm run generate:check` | Перегенерация + падение при diff в generated-файлах (защита от drift) |
| `npm run typecheck` | TypeScript typecheck всех workspaces |
| `npm test` | Контрактный gate: сверяет `generated/openapi.yaml` с границами контракта |
| `npm test -w @minical/api` | Backend-гейт: `node --test` по `apps/api/src/**/*.test.ts` (покрытие контракта, домен, хранилище, HTTP-сценарии) |
| `npm test -w @minical/client` | Клиентский гейт: `jest` (preset `jest-expo`) по `apps/client/src/**/*.test.ts(x)` — дизайн-система, маппер ошибок, use-cases, guest-flow state |
| `npm run mock:prism` | Mock-сервер контракта (Prism) на порту `4010` по `packages/contracts/generated/openapi.yaml` |
| `npm run build` | Сборка workspaces, у которых есть скрипт `build` (клиент → web-экспорт). `apps/api` в ней не участвует: backend запускается прямо из исходников |
| `npm run db:up` | Поднять PostgreSQL и дождаться healthy |
| `npm run db:down` | Остановить контур, данные сохраняются |
| `npm run db:logs` | Логи PostgreSQL, follow |
| `npm run db:reset` | Остановить и **удалить volume** — данные теряются безвозвратно |
| `npm run task -- status [id]` | Стадия и контекст задачи (или всех задач) |
| `npm run task -- new <тип> <слаг> [--lite]` | Завести новую задачу |
| `npm run task:check` | Целостность задач и свежесть `REGISTRY.md` (входит в `npm test`) |
| `npm run task:test` / `npm run task:typecheck` | Тесты и типы CLI-инструмента задач; обязательны при изменениях `tasks/tools/` |

Полный список команд `task` (`approve`, `draft`, `set`/`unset`, `promote`, `repair`, `registry` и другие) — в [`tasks/AGENTS.md`](tasks/AGENTS.md).

Generated-каталоги (`packages/contracts/generated`, `packages/api-client/src/generated`, `packages/backend-contract/src/generated`) вручную не редактируются.

## Запуск

Backend API (`http://localhost:3001`): все 12 операций контракта поверх in-memory хранилища, предварительная сборка не нужна — сервер исполняет TypeScript-исходники напрямую.

```bash
npm start -w @minical/api          # node src/server.ts
# или
npm run dev -w @minical/api        # то же, с watch
```

- **Конфигурация:** `PORT` (по умолчанию `3001`) и `PUBLIC_WEB_URL` (по умолчанию `http://localhost:8081`) — канонический адрес гостевого web-клиента, который backend отдаёт в поле `publicUrl` ответов настроек. Неверное значение любой из переменных завершает старт с сообщением, а не откатывается к дефолту.
- **Состояние живёт в процессе:** после перезапуска onboarding нужно проходить заново (`PUT /admin/setup`), сидов нет.

```bash
curl http://localhost:3001/health   # {"status":"ok"}
```

Mock-сервер контракта (`http://localhost:4010`); отвечает на все 12 операций контракта по `packages/contracts/generated/openapi.yaml` и не требует backend, PostgreSQL или Docker:

```bash
npm run mock:prism
```

- **Режим валидации:** запрос, не соответствующий контракту (пропущенное обязательное поле, нарушение `pattern`, типа и т. п.), отклоняется: если операция документирует 4xx-ответ — им (для `POST /bookings` фактически `400`), иначе — сгенерированным `422`; детализация — в заголовке `sl-violations`. Конкретный не-2xx ответ можно запросить штатным механизмом Prism: `curl -X POST http://localhost:4010/bookings -H "Prefer: code=404" ...`.
- **Дефолтный успешный ответ `POST /bookings` — `200`, а не `201`:** контракт документирует у этой операции два успешных статуса (`201` — бронь создана, `200` — идемпотентный повтор), а Prism выбирает наименьший 2xx. `201` запрашивается тем же механизмом: `curl -X POST http://localhost:4010/bookings -H "Prefer: code=201" ...`. Клиент обязан трактовать любой 2xx как успех.
- **Ограничение:** error-тела отдаются сгенерированным примером `{"code":"string","message":"string"}`, не соответствующим enum-схемам ошибок; статус выбирается верно, точная форма ошибки — нет.
- **Переключение клиента:** generated SDK (`@minical/api-client`) настраивается на мок через `client.setConfig({ baseUrl: 'http://localhost:4010' })`; при готовности backend — `baseUrl: 'http://localhost:3001'`. Никаких изменений кода кроме конфигурации base URL не требуется.

Порты: `3001` — backend API, `4010` — mock-сервер, `8081` — Metro/`expo start`.

Клиент:

```bash
npm run web -w @minical/client     # web dev server
npm run android -w @minical/client # Android (эмулятор/устройство на хосте)
npm run build -w @minical/client   # production web-экспорт в apps/client/dist
```

Единая сборка клиента содержит оба флоу; какой из них монтируется и куда он ходит за данными, задают две переменные окружения. Обе читаются статически (`process.env.EXPO_PUBLIC_APP_MODE`), поэтому Expo инлайнит их в бандл на старте — **после смены значения dev-сервер нужно перезапустить с `--clear`**, иначе применится закешированное:

- **`EXPO_PUBLIC_APP_MODE`** — `guest` (по умолчанию) или `owner`. Любое другое значение, пустая строка и отсутствие переменной дают гостевой флоу; owner-корень (`SetupCheck → Onboarding → OwnerTabs`) монтируется только при точном `owner`.
- **`EXPO_PUBLIC_API_BASE_URL`** — адрес API. По умолчанию — mock-сервер: `http://localhost:4010`, на Android-эмуляторе `http://10.0.2.2:4010` (внутри эмулятора `localhost` — он сам). Для работы против реального backend нужен явный адрес.

```bash
# owner-флоу в браузере против реального backend
EXPO_PUBLIC_APP_MODE=owner EXPO_PUBLIC_API_BASE_URL=http://localhost:3001 \
  npm run web -w @minical/client -- --clear

# owner-флоу на Android-эмуляторе
EXPO_PUBLIC_APP_MODE=owner EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3001 \
  npm run android -w @minical/client

# гостевой флоу — как раньше, переменные не нужны
npm run web -w @minical/client
```

Auth в MVP нет: owner-режим — способ локально открыть экраны владельца, а не защищённая роль (правило 9 корневого `AGENTS.md`). Оба режима ходят в один backend, состояние onboarding общее.

Android debug APK:

```bash
cd apps/client
npx expo prebuild --platform android
cd android && ANDROID_HOME="$HOME/Library/Android/sdk" ./gradlew assembleDebug
# артефакт: apps/client/android/app/build/outputs/apk/debug/app-debug.apk
```

PostgreSQL (`localhost:5432`) — локальный runtime-контур на Docker Compose:

```bash
npm run db:up
```

- **Готовность:** команда сама дожидается состояния healthy (`docker compose up -d --wait`), отдельно ждать не нужно.
- **Порт:** на хосте `5432`, переопределяется `POSTGRES_PORT`; в контейнере всегда `5432`.
- **Базы:** `minical` (разработка) и `minical_test` (проверки `back/002`) — создаются при первом запуске на пустом volume.
- **Доступ:** пользователь и пароль по умолчанию — `minical`/`minical`. Полный список переменных и их дефолтов — в `infra/.env.example`, переопределяются файлом `infra/.env` (в `.gitignore`, наружу не публикуется).
- **`psql` на хосте не нужен** — обращения к базе идут изнутри контейнера:
  ```bash
  docker compose -f infra/compose.yml exec -T postgres psql -U minical -d minical -c "\l"
  ```
- **Полный сброс данных:**
  ```bash
  npm run db:reset   # docker compose down -v — данные и volume удаляются безвозвратно
  npm run db:up      # базы создаются заново пустыми
  ```
  Init-скрипты `/docker-entrypoint-initdb.d/` выполняются только при инициализации пустого каталога данных: изменение набора баз требует `db:reset`, правка скрипта поверх существующего volume не применится.
- **Только для локальной учебной среды:** пароль по умолчанию слабый, auth в MVP нет, контур наружу не публикуется.
- Ручные вызовы Compose требуют `-f infra/compose.yml` (файл — в зоне `infra/`), штатный путь — npm-скрипты выше.

Существующие способы запуска не меняются и базы не требуют: `npm start -w @minical/api` (in-memory), `npm run web -w @minical/client`, `npm run mock:prism` работают как раньше.

## Структура

```text
apps/client               React Native / React Web клиент (Expo)
apps/api                  REST API: 12 операций контракта на Express 5, in-memory хранилище
packages/contracts        Ручной TypeSpec-контракт + generated OpenAPI
packages/api-client       Generated frontend SDK
packages/backend-contract Generated backend types + Zod schemas
packages/slot-engine      Slot Engine (появится в implementation task)
packages/database         PostgreSQL schema и миграции (появятся в implementation task)
infra                     Docker/Compose: compose.yml, .env.example, postgres/initdb/
```

Рабочий процесс задач: [`tasks/AGENTS.md`](tasks/AGENTS.md) (маршрутизатор), правила треков — [`tasks/flows/`](tasks/flows/), реестр и очередь работ — [`tasks/REGISTRY.md`](tasks/REGISTRY.md).

## Внутренние документы

Каталоги `docs/` и `.opencode/` (а также `CLAUDE.md` и `.mcp.json`) — локальные артефакты AI-процесса разработки; они намеренно не публикуются в репозитории (см. [`.gitignore`](.gitignore)). Ссылки на них в этом README (например, `docs/architecture.md`) работают только в локальной рабочей копии, где эти каталоги присутствуют. `tasks/` — в git с 2026-08-16 и доступен в любом клоне; ссылки на него (например, [`tasks/AGENTS.md`](tasks/AGENTS.md)) работают везде.
