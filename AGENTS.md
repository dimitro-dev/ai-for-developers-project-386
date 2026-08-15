# AGENTS.md — MiniCal

Короткая точка входа для новой AI-сессии. Сначала определи активную задачу через `npm run task -- status`, затем загружай только связанные документы и `AGENTS.md` тех зон, которые будешь менять.

## Проект

MiniCal — учебный сервис бронирования без регистрации и авторизации:

- единый React Native / React Web клиент (`apps/client/`): Android и web обязательны, iOS проверяется локально на macOS при доступном toolchain;
- REST backend (`apps/api/`) — источник истины для настроек календаря, слотов и бронирований;
- PostgreSQL — постоянное состояние и защита бизнес-инвариантов;
- Docker Compose — локальный runtime (`infra/001`); отдельный Docker builder собирает Android APK (`infra/002`).

## Правила проекта

1. Владелец календаря один; гость не создаёт аккаунт, его данные сохраняются внутри Booking.
2. Не добавляй auth, роли, несколько владельцев или функции вне MVP без отдельной задачи.
3. Пересекающиеся Booking запрещены глобально, в том числе для разных Event Type.
4. Слоты и `endAt` определяет backend; клиент не является источником истины.
5. HTTP-контракт вручную меняется только в `packages/contracts/src/**/*.tsp`.
6. Generated-файлы не редактируются вручную.
7. Вся работа ведётся внутри `tasks/<тип>/<номер>-<слаг>/` по треку `full` или `lite`; состав документов, гейты и команды — в [`tasks/AGENTS.md`](tasks/AGENTS.md).
8. Не меняй согласованные требования или архитектуру скрыто в коде. Верни соответствующий гейт в `черновик` (`npm run task -- draft <id> <гейт>`) и обнови зависимые документы.
9. Admin без auth предназначен только для локальной учебной среды.
10. Работай в границах места: в директории со своим `AGENTS.md` действуют его правила — прочитай его до первой правки.
11. Статус `согласовано` ставится только после явного подтверждения пользователя или назначенного reviewer и фиксируется командой `npm run task -- approve <id> <гейт>`.

## Bootstrap новой сессии

1. Прочитай этот файл.
2. Проверь `git status`, текущую ветку и незавершённые изменения.
3. `npm run task -- status [id]` — id из запроса пользователя; без id команда покажет незавершённые задачи, и если активная одна — сразу её. В выводе: трек, стадия, активный гейт, прогресс пунктов, зависимости, workspace.
4. Прочитай [`tasks/AGENTS.md`](tasks/AGENTS.md), если его ещё нет в контексте, затем flow трека задачи: [`flows/full.md`](tasks/flows/full.md) или [`flows/lite.md`](tasks/flows/lite.md).
5. Прочитай документы задачи: full — `brief.md` → `adr.md` → `plan.md` → `result.md`; lite — `task.md`. Активный документ — тот, чей гейт первым стоит в `черновик`; его называет `task status`.
6. Открой `AGENTS.md` зон, которые будешь менять, и только релевантные глобальные документы.
7. Во время реализации веди состояния пунктов в `plan.md` (или чеклисте `task.md`), а выполненное и проверки — в разделе результата. Статусы гейтов меняет только CLI.

Шаги 3–6 выполняет скилл `taskmaster`: `/taskmaster` или автозапуск по триггерам («продолжи задачу», «что по задаче X»).

Новая задача заводится командой `npm run task -- new <тип> <слаг> [--lite] [--stub]` — каталог и шаблон разворачивает CLI, вручную `_template/` не копируется. Трек выбирается по критериям в [`flows/lite.md`](tasks/flows/lite.md), утверждает владелец. Что делать дальше по проекту — очередь работ в [`tasks/REGISTRY.md`](tasks/REGISTRY.md).

Правила доставляются по месту: корневой файл описывает только глобальное, остальное — во вложенных `AGENTS.md` (карта в разделе «Зоны и их AGENTS.md»). Зональный файл уточняет корневые правила, а не отменяет их.

## Навигация

Каталоги `docs/` и `.opencode/` не хранятся в git (см. `.gitignore`) и доступны только в локальной рабочей копии — ссылки на них работают лишь там, где эти каталоги присутствуют. `tasks/` находится в git и приезжает с клоном.

| Нужно | Открой / запусти |
|---|---|
| Продолжить работу, понять стадию и активный гейт задачи | `npm run task -- status [id]` |
| Правила процесса задач: структура, команды CLI, словарь | [`tasks/AGENTS.md`](tasks/AGENTS.md) |
| Правила трека: документы, гейты, откаты, чек-лист закрытия | [`tasks/flows/full.md`](tasks/flows/full.md), [`tasks/flows/lite.md`](tasks/flows/lite.md) |
| Реестр задач, очередь работ, старые id | [`tasks/REGISTRY.md`](tasks/REGISTRY.md) |
| Завести задачу | критерии трека в [`flows/lite.md`](tasks/flows/lite.md) → `npm run task -- new <тип> <слаг>` |
| Изменить onboarding, расписание, Event Type, Slot или Booking | [`docs/domain-rules.md`](docs/domain-rules.md) |
| Спроектировать API, backend, database или QA — сущности, VO, кардинальности, инварианты | [`docs/domain-model.md`](docs/domain-model.md) |
| Работать со структурой репозитория, границами компонентов, Docker или build/runtime | [`docs/architecture.md`](docs/architecture.md) |
| Разрешить конфликт задачи, глобальных правил, TypeSpec и реализации | [`docs/sources-of-truth.md`](docs/sources-of-truth.md) |
| Изменить TypeSpec, API или generated packages | [`docs/contract-pipeline.md`](docs/contract-pipeline.md) |
| Реализовать экран owner-flow или guest-flow — внешний вид, состояния, токены | [`docs/ui-spec-kit/README.md`](docs/ui-spec-kit/README.md) и [`MANUAL.md`](docs/ui-spec-kit/MANUAL.md) |
| Узнать требования к окружению, установку, полный список команд и способы запуска | [`README.md`](README.md) |
| Изменить набор routes/операций контракта | [`tests/contract-validation.test.ts`](tests/contract-validation.test.ts) — gate сверяет их точный список |
| Работать с React Native / Web клиентом | [`apps/client/AGENTS.md`](apps/client/AGENTS.md) |
| Работать над backend — фреймворк, middleware, структура | [`apps/api/AGENTS.md`](apps/api/AGENTS.md) |

## Структура репозитория

Фактическое состояние. Целевой контур и правила его изменения — в [`docs/architecture.md`](docs/architecture.md).

```text
minical/
├── AGENTS.md                  этот файл — точка входа сессии
├── CLAUDE.md                  только ссылка на AGENTS.md (локальный, в .gitignore)
├── .mcp.json                  канонический реестр MCP-серверов (локальный, в .gitignore)
├── README.md                  окружение, установка, команды, запуск
├── package.json               корневые скрипты, npm workspaces: apps/*, packages/*
├── tsconfig.base.json         общая TS-база: ES2022, NodeNext, strict
├── .nvmrc                     Node 26 (engines: >=24)
├── .github/workflows/         hexlet-check.yml — внешний чек Hexlet, не редактируется;
│                              ci.yml — обязательные проверки на PR/push в `main`;
│                              release-please.yml — release-PR (changelog + версия)
├── apps/
│   ├── api/                   @minical/api — REST API: 12 операций контракта на Express 5
│   │   │                       поверх in-memory хранилища, порт 3001; запускается из
│   │   │                       исходников (`node src/server.ts`), сборки в dist нет
│   │   ├── AGENTS.md           слои, точка валидации, таблица статусов, ограничения strip-only
│   │   ├── package.json / tsconfig.json    noEmit + allowImportingTsExtensions
│   │   └── src/                server.ts, config.ts, app.ts,
│   │                           http/ (routes, handlers, parse, present, errors, security),
│   │                           usecases/ (owner, booking),
│   │                           domain/ (model, errors, slots, timezone),
│   │                           store/ (repositories, memory),
│   │                           тесты рядом с кодом: *.test.ts (`node --test`)
│   └── client/                @minical/client — Expo 57, React Native 0.86, react-native-web;
│       │                       гостевой фундамент: дизайн-система, generated SDK, навигация
│       ├── AGENTS.md          правила зоны клиента и требование читать docs Expo v57
│       ├── CLAUDE.md          @AGENTS.md
│       ├── package.json       jest-конфиг (preset jest-expo, alias @/*), скрипт test
│       ├── app.json / App.tsx / index.ts / assets/    App.tsx — bootstrap: configureApiClient →
│       │                       GuestFlowProvider → NavigationContainer (без linking) → GuestStack
│       ├── .claude/settings.json    включённый плагин expo
│       ├── tsconfig.json      наследует expo/tsconfig.base, а не корневую базу; свой TypeScript
│       │                       ~6.0.3; paths "@/*" → ./src/* (без baseUrl — он deprecated в TS 6)
│       └── src/               api/ (config, errors → канон $error),
│                               design-system/ (tokens, theme, layout/, components/),
│                               features/guest/ (model, usecases, state, lib, screens — стабы),
│                               navigation/ (GuestStack, GuestStackParamList),
│                               shared/ui-state/ (StateView, Repeat),
│                               тесты рядом с кодом: *.test.ts(x) (`jest`)
├── packages/
│   ├── contracts/             @minical/contracts — единственный ручной источник HTTP-контракта
│   │   ├── AGENTS.md                   правила зоны контракта и generation pipeline
│   │   ├── src/main.tsp                @service, @info(version), импорты
│   │   ├── src/models/                 common, errors, owner, event-type, booking
│   │   ├── src/operations/             health, admin, public
│   │   ├── tspconfig.yaml              эмиттер @typespec/openapi3 → generated/openapi.yaml
│   │   └── generated/openapi.yaml      фактически OpenAPI 3.0.0 (версия в конфиге не зафиксирована)
│   ├── api-client/            @minical/api-client — generated frontend SDK (@hey-api/client-fetch)
│   ├── backend-contract/      @minical/backend-contract — generated types + Zod schemas
│   ├── slot-engine/           .gitkeep — появится в отдельной задаче
│   └── database/              AGENTS.md + .gitkeep — schema и миграции, отдельная задача
├── tests/
│   ├── AGENTS.md              правила зоны проверок: контрактные, доменные, интеграционные, E2E
│   └── contract-validation.test.ts   контрактный gate, запускается через `npm test`
├── infra/                     AGENTS.md + .gitkeep — Docker/Compose (`infra/001`)
├── tasks/                     процесс задач; в git
│   ├── AGENTS.md              маршрутизатор каталога: карта, команды CLI, словарь
│   ├── REGISTRY.md            генерат `task registry`: реестр по типам, очередь работ, legacy-id
│   ├── flows/                 full.md, lite.md — правила треков, гейтов и откатов
│   ├── tasks.config.json      типы, статусы, состояния пунктов, треки, hash-стратегии
│   ├── _template/             full/ (brief, adr, plan, result), lite/ (task.md)
│   ├── tools/                 CLI: task.ts, lib/, tests/ (`task:test`, `task:typecheck`)
│   ├── archive/               000…003, 006 — дотиповая эпоха, как есть, не трогается
│   ├── contract/              001-guest-flow-extensions/
│   ├── infra/                 001-postgres-compose/ … 006-ci-release-please/
│   ├── back/                  001-api-skeleton/, 002-database-persistence/, 003-slot-engine-package/
│   ├── front/                 ui/, guest/, owner/ — например front/guest/002-guest-screens/
│   └── process/               001-tasks-rework/
├── docs/                      локальные документы AI-процесса, не в git
└── .opencode/                 скиллы AI-процесса, не в git
```

Каждая задача — `<номер>-<слаг>/` с `task.yaml` (канон состояния) и документами своего трека. Канонический id — путь без слага: `front/guest/002`, `infra/006`.

`packages/slot-engine`, `packages/database` и `infra` кода пока не содержат — только `AGENTS.md` зоны и `.gitkeep`. Не наполняй их кодом без задачи, которая это предусматривает.

### Пакеты и границы

| Пакет | Роль | Кто меняет |
|---|---|---|
| `@minical/contracts` | Ручной TypeSpec и производный OpenAPI | по [`packages/contracts/AGENTS.md`](packages/contracts/AGENTS.md) |
| `@minical/api-client` | Generated frontend SDK | никто вручную — только `npm run generate` |
| `@minical/backend-contract` | Generated transport types и runtime Zod-схемы | никто вручную — только `npm run generate` |
| `@minical/api` | REST, application logic, mapping transport ↔ domain ↔ persistence | по [`apps/api/AGENTS.md`](apps/api/AGENTS.md) |
| `@minical/client` | UI, навигация, состояния экранов по generated SDK | по [`apps/client/AGENTS.md`](apps/client/AGENTS.md) |

Backend валидирует входящий transport-запрос generated Zod-схемами: generated TypeScript-типы не заменяют runtime-валидацию.

### Локальные каталоги AI-процесса

```text
docs/
├── domain-rules.md            поведение onboarding, расписания, слотов, Booking
├── domain-model.md            сущности, VO, кардинальности, инварианты
├── architecture.md            архитектурный стиль, компоненты, целевая структура, runtime
├── sources-of-truth.md        владение источниками правды и иерархия при конфликте
├── contract-pipeline.md       порядок изменения контракта и генерации
└── ui-spec-kit/               декларативная UISpec owner-flow и guest-flow
    ├── README.md / MANUAL.md / uispec.config.json
    ├── AUDIT.md / ROADMAP.md      аудит кита 2026-08-05 и исполненный план исправлений R1–R6
    ├── specs/ui/screens/          экраны owner-flow и guest-flow (*.screen.md) + FRAME_MAP.md
    ├── specs/ui/components/       компоненты (*.component.md)
    ├── specs/ui/tokens/           colors, typography, spacing, radii, sizes, motion
    ├── specs/ui/navigation/ registry/ bindings/ schema/ assets/
    │                              (bindings: api-bindings.xml — единственная связь action→operationId,
    │                               contract-gaps.xml — реестр расхождений с контрактом)
    └── tools/uispec/              валидатор (V1–V11, --config/--strict/--lint), генератор каркасов,
                                   tests/ — негативные фикстуры валидатора

.opencode/
└── skills/                    brainstorming, decomposition, grill-me, grilling, lean-code,
                               taskmaster, uispec-generator, verification-before-completion,
                               worktree-isolated-agent
```

## Обязательные проверки (quality gates)

Набор ниже — фаза «Проверка» (**quality gates**) жизненного цикла задачи (все стадии — в [`tasks/flows/full.md`](tasks/flows/full.md)): когда все пункты плана завершены, полный набор прогоняется локально и результаты фиксируются в разделе «Выполненные проверки» — только после этого готовится MR. При завершении отдельного пункта плана полный прогон не требуется — достаточно гейтов затронутой области (см. аннотации у команд):

```bash
npm run contracts:format:check   # форматирование .tsp
npm run generate:check           # перегенерация + падение при diff в generated (защита от drift)
npm run typecheck                # tsc --noEmit по всем workspaces
npm test                         # контрактный gate (включает uispec:validate и task:check)
npm run task:check               # целостность task.yaml и свежесть REGISTRY; входит в `npm test`, в CI выполняется по-настоящему — tasks/ в git
npm run uispec:validate          # валидация UISpec; обязательна при изменениях в docs/ui-spec-kit/ или UI-коде apps/client/, в клоне без docs/ шаг скипается
npm test -w @minical/api         # backend-гейт (node --test); обязателен при изменениях в apps/api/
npm test -w @minical/client      # клиентский гейт (jest + jest-expo); обязателен при изменениях в apps/client/
```

При изменениях в `tasks/tools/` дополнительно обязательны `npm run task:test` (тесты CLI) и `npm run task:typecheck`.

Корневой `npm test` — это `uispec:validate` и `task:check` плюс один Node-скрипт с `--experimental-strip-types`, отдельный тест выбрать нельзя. Тесты приложений в него не входят и запускаются своими командами: backend — `node --test` по `apps/api/src/**/*.test.ts` (можно выбрать файл: `node --test src/domain/slots.test.ts`), клиент — `jest` по `apps/client/src/**/*.test.ts(x)` (можно выбрать файл: `npx jest src/api/errors.test.ts` из `apps/client`). Полный список команд — в [`README.md`](README.md).

Тот же набор выполняет CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) на каждом PR в `main` и push в `main` — это страховка после push, а не замена фазы «Проверка»: в CI-клоне нет `docs/`, поэтому `uispec:validate` там штатно скипается, и зелёный CI не отменяет локальный полный прогон. На push в `main` [`release-please.yml`](.github/workflows/release-please.yml) ведёт release-PR.

## Зоны и их AGENTS.md

Отдельного механизма ролей нет: правила доставляются положением файла. Работаешь в зоне — прочитай её `AGENTS.md` до первой правки.

| Зона | Файл | О чём |
|---|---|---|
| `apps/api/` | [`apps/api/AGENTS.md`](apps/api/AGENTS.md) | REST, слои, application logic, Slot Engine |
| `apps/client/` | [`apps/client/AGENTS.md`](apps/client/AGENTS.md) | React Native / Web UI по generated SDK и UISpec |
| `packages/contracts/` | [`packages/contracts/AGENTS.md`](packages/contracts/AGENTS.md) | TypeSpec-контракт и generation pipeline |
| `packages/database/` | [`packages/database/AGENTS.md`](packages/database/AGENTS.md) | PostgreSQL schema, migrations и constraints |
| `infra/` | [`infra/AGENTS.md`](infra/AGENTS.md) | Toolchain, Docker, Compose, CI и Android builder |
| `tests/` | [`tests/AGENTS.md`](tests/AGENTS.md) | Контрактные, доменные, интеграционные и E2E-проверки |
| `tasks/` | [`tasks/AGENTS.md`](tasks/AGENTS.md) | Процесс задач: структура, CLI, треки |

Harness отдельного файла не имеет: он следует этому файлу, lifecycle активной задачи и `AGENTS.md` тех зон, которые затрагивает.

### Как скиллы и MCP попадают в сессию

Проектные инструкции процесса физически лежат в `.opencode/`, и разные харнессы видят их по-разному. Не рассчитывай на автоподхват — проверяй по этой таблице:

| Артефакт | OpenCode | Claude Code |
|---|---|---|
| `.opencode/skills/*/SKILL.md` — 9 скиллов; `scripts/` у `uispec-generator` — симлинк на `docs/ui-spec-kit/tools/uispec` (канон скриптов один, копии нет) | автоматически как skills | подхватываются через симлинк `.claude/skills → ../.opencode/skills` — проверено на живой сессии. Без симлинка `SKILL.md` читается как Markdown |
| `.mcp.json` в корне — канонический реестр MCP-серверов (формат `mcpServers`) | **не читается** (feature request закрыт как not planned): у OpenCode свой формат — секция `mcp` в `opencode.json`, записи зеркалирует владелец вручную | подхватывается автоматически как project-scope MCP; первое использование сервера требует одобрения пользователя |

Практические следствия:

- «обязательный скилл» во вложенном `AGENTS.md` означает обязательный *процесс* из `SKILL.md`; выполнить его вручную по шагам — полноценное соблюдение правила;
- `grill-me` помечен `disable-model-invocation: true`, поэтому в модельном списке скиллов его нет и агент сам его не вызовет — он запускается только пользователем через `/grill-me`. Остальные восемь доступны агенту;
- `tasks/` приезжает с клоном, а `.claude/`, `.opencode/`, `docs/` и `.mcp.json` — нет: в свежем клоне нет ни скиллов, ни симлинков, ни UISpec, их восстанавливает владелец рабочей копии;
- MCP-серверы описываются только в `.mcp.json` — это единственный источник правды; зеркало в `opencode.json` обновляется следом за ним. Оба файла в `.gitignore` (внутри могут быть локальные пути и env-секреты), свежий клон MCP-серверов не получает;
- при добавлении новой зоны, скилла или MCP-сервера обнови таблицы в этом файле: манифеста, который бы их перечислял, нет — единственный реестр здесь.

## Generated: read-only

```text
packages/contracts/generated/**
packages/api-client/src/generated/**
packages/backend-contract/src/generated/**
```

## Изменяется только инструментом

Ниже — состояние процесса, а не текст: руками и через Edit не правится, единственный писатель — `npm run task`.

```text
tasks/**/task.yaml
tasks/REGISTRY.md
```
