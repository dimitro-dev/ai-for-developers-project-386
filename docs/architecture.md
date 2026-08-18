# Архитектура MiniCal

## Архитектурный стиль

На этапе MVP используется модульный монолит. Логические модули разделены в коде, но backend разворачивается одним API-процессом.

```text
React Native / React Web
        │ generated SDK
        ▼
Backend REST API
        │
        ├── owner setup / calendar settings
        ├── event types
        ├── availability / slot engine
        └── bookings
        │
        ▼
PostgreSQL
```

## Компоненты

### Client

Один TypeScript-кодовый контур:

- React Native для Android;
- React Web для публичной страницы и admin UI;
- iOS запускается локально на macOS, если native toolchain доступен.

Клиент отвечает за UI, навигацию и отображение состояний. Он не является источником истины для слотов, `endAt` или занятости.

### Backend API

Backend отвечает за:

- singleton-профиль владельца;
- onboarding и настройки календаря;
- EventType;
- расчёт 14-дневного окна и слотов;
- повторную проверку бронирования;
- вычисление `endAt`;
- преобразование доменных ошибок в HTTP-ответы.

### PostgreSQL

Хранит постоянное состояние и защищает инварианты:

- уникальный публичный `EventType.id`;
- UTC timestamps встреч;
- snapshot данных гостя;
- глобальный запрет пересечения активных бронирований.

### Contract packages

```text
packages/contracts          TypeSpec и generated OpenAPI
packages/api-client         generated frontend SDK
packages/backend-contract   generated transport types и runtime schemas
```

API DTO, domain model и database schema не должны быть одной и той же моделью.

## Локальный runtime

```text
web container
api container
postgres container
```

Build-time:

```text
android-builder container → APK artifact
```

Android Emulator работает на хосте и обращается к gateway через адрес хоста эмулятора. iOS toolchain не запускается в Linux Docker.

## Security boundary

В MVP нет auth. Поэтому admin API и UI допустимы только для локальной учебной среды. Публикация в интернет требует отдельного решения по доступу и не может считаться безопасной за счёт пути `/admin`.

## Целевая структура репозитория

```text
minical/
├── AGENTS.md                  точка входа AI-сессии, реестр ролей и скиллов
├── CLAUDE.md                  ссылка на AGENTS.md (локальный, в .gitignore)
├── README.md                  окружение, установка, команды, запуск
├── package.json               npm workspaces и корневые скрипты
├── tsconfig.base.json         общая TS-база
├── .nvmrc                     версия Node
├── .github/workflows/         hexlet-check.yml — внешний чек учебной платформы (не
│                              редактируется); ci.yml — обязательные проверки на PR/push
│                              в main; release-please.yml — release-PR (task-infra-006)
├── .claude/
│   └── skills → ../.opencode/skills    симлинк, чтобы скиллы видел Claude Code
├── .opencode/
│   └── skills/                скиллы AI-процесса (роли растворены во вложенных AGENTS.md
│                              зон: apps/api, apps/client, packages/contracts,
│                              packages/database, infra, tests)
├── docs/
│   ├── domain-rules.md
│   ├── domain-model.md
│   ├── architecture.md
│   ├── sources-of-truth.md
│   ├── contract-pipeline.md
│   └── ui-spec-kit/           UISpec owner-flow (экраны 01–11, approved) и
│                              guest-flow (экраны 12–15, draft, spec-first без
│                              reference-кадров): screens, components, tokens,
│                              navigation (включая GuestStack), registry,
│                              bindings (в т.ч. guest-операций), tools, assets
├── tasks/
│   ├── AGENTS.md
│   ├── REGISTRY.md            генерат task registry, руками не правится
│   ├── tasks.config.json
│   ├── flows/
│   │   ├── full.md
│   │   └── lite.md
│   ├── _template/
│   │   ├── full/
│   │   │   ├── brief.md
│   │   │   ├── adr.md
│   │   │   ├── plan.md
│   │   │   └── result.md
│   │   └── lite/
│   │       └── task.md
│   ├── tools/                 CLI и его тесты
│   ├── archive/                дотиповая эпоха, как есть
│   └── <тип>/<номер>-<слаг>/   тип: contract | infra | back | front/ui | front/guest |
│       │                       front/owner | process
│       ├── task.yaml           канон состояния — пишет только CLI
│       ├── brief.md
│       ├── adr.md
│       ├── plan.md
│       └── result.md
├── apps/
│   ├── client/
│   └── api/
├── packages/
│   ├── contracts/
│   │   ├── src/
│   │   └── generated/openapi.yaml
│   ├── api-client/
│   │   └── src/generated/
│   ├── backend-contract/
│   │   └── src/generated/
│   ├── slot-engine/
│   └── database/
├── infra/
└── tests/
    └── contract-validation.test.ts     контрактный gate
```

Фактическое состояние структуры с назначением каждого каталога и пометками о пустых заготовках — в `AGENTS.md`, раздел «Структура репозитория». Этот документ описывает целевой контур; при расхождении обновляются оба.

Не создавай параллельную альтернативную структуру без изменения `adr.md` активной задачи. Отдельного глобального каталога ADR и отдельного Orchestrator Agent в проекте нет.

## Поток создания бронирования

```text
1. Client получает слоты от API.
2. Гость выбирает startAt и вводит данные.
3. API валидирует transport request.
4. Backend заново получает EventType и настройки.
5. Backend вычисляет endAt и повторно проверяет слот.
6. PostgreSQL-транзакция пытается создать Booking.
7. Exclusion constraint является последней защитой от гонки.
8. API возвращает Booking либо документированную ошибку.
```

## Когда менять task ADR

`adr.md` обязателен для каждой задачи полного трека (`tasks/<тип>/<номер>-<слаг>/adr.md`) и должен явно подтвердить отсутствие архитектурного влияния либо зафиксировать решение; у lite-трека решение — секция в `task.md`. Особое внимание требуется, если предлагается:

- сменить архитектурный стиль;
- добавить auth или несколько владельцев;
- заменить PostgreSQL или способ защиты пересечений;
- изменить ownership источников правды;
- добавить внешний сервис или очередь;
- поменять contract-generation pipeline.
