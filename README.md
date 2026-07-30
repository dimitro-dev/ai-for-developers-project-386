### Hexlet tests and linter status:
[![Actions Status](https://github.com/dimitro-dev/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/dimitro-dev/ai-for-developers-project-386/actions)

# MiniCal

Учебный сервис бронирования без регистрации и авторизации: владелец календаря настраивает расписание и типы событий, гость бронирует свободный слот. Подробности — в [`AGENTS.md`](AGENTS.md) и [`docs/architecture.md`](docs/architecture.md).

## Требования к окружению

- Node.js 26 (файл [`.nvmrc`](.nvmrc); поддерживается `>=24`) и npm 11+
- Git
- Для Android debug-сборки клиента: Android SDK и JDK 17 на хосте
- Docker для текущего этапа **не требуется**: Docker/Compose-контур вынесен в отдельную задачу

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
| `npm run build` | Сборка всех workspaces (API → `dist/`, клиент → web-экспорт) |

Generated-каталоги (`packages/contracts/generated`, `packages/api-client/src/generated`, `packages/backend-contract/src/generated`) вручную не редактируются.

## Запуск

Smoke API (`http://localhost:3001/health`); endpoint соответствует контрактному `GET /health` и возвращает `{"status":"ok"}`:

```bash
npm run dev -w @minical/api        # из исходников, с watch
# или
npm run build -w @minical/api && npm run start -w @minical/api
```

Клиент:

```bash
npm run web -w @minical/client     # web dev server
npm run android -w @minical/client # Android (эмулятор/устройство на хосте)
npm run build -w @minical/client   # production web-экспорт в apps/client/dist
```

Android debug APK:

```bash
cd apps/client
npx expo prebuild --platform android
cd android && ANDROID_HOME="$HOME/Library/Android/sdk" ./gradlew assembleDebug
# артефакт: apps/client/android/app/build/outputs/apk/debug/app-debug.apk
```

## Структура

```text
apps/client               React Native / React Web клиент (Expo)
apps/api                  Smoke HTTP-сервер (прикладной backend — отдельная задача)
packages/contracts        Ручной TypeSpec-контракт + generated OpenAPI
packages/api-client       Generated frontend SDK
packages/backend-contract Generated backend types + Zod schemas
packages/slot-engine      Slot Engine (появится в implementation task)
packages/database         PostgreSQL schema и миграции (появятся в implementation task)
infra                     Docker/Compose (отдельная задача)
```

Рабочий процесс задач описан в [`tasks/README.md`](tasks/README.md).

## Внутренние документы

Каталоги `docs/`, `tasks/` и `.opencode/` — локальные артефакты AI-процесса разработки; они намеренно не публикуются в репозитории (см. [`.gitignore`](.gitignore)). Ссылки на них в этом README (например, `docs/architecture.md`, `tasks/README.md`) работают только в локальной рабочей копии, где эти каталоги присутствуют.
