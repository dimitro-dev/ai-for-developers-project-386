# AGENTS.md — MiniCal

Короткая точка входа для новой AI-сессии. Сначала найди активную задачу, затем загружай только связанные документы и инструкцию нужной роли.

## Проект

MiniCal — учебный сервис бронирования без регистрации и авторизации:

- единый React Native / React Web клиент (`apps/client/`): Android и web обязательны, iOS проверяется локально на macOS при доступном toolchain;
- REST backend (`apps/api/`) — источник истины для настроек календаря, слотов и бронирований;
- PostgreSQL — постоянное состояние и защита бизнес-инвариантов;
- Docker Compose — локальный runtime (`task-infra-001`); отдельный Docker builder собирает Android APK (`task-infra-002`).

## Правила проекта

1. Владелец календаря один; гость не создаёт аккаунт, его данные сохраняются внутри Booking.
2. Не добавляй auth, роли, несколько владельцев или функции вне MVP без отдельной задачи.
3. Пересекающиеся Booking запрещены глобально, в том числе для разных Event Type.
4. Слоты и `endAt` определяет backend; клиент не является источником истины.
5. HTTP-контракт вручную меняется только в `packages/contracts/src/**/*.tsp`.
6. Generated-файлы не редактируются вручную.
7. Вся работа ведётся внутри `tasks/task-<task-id>/` через `brief.md`, `adr.md`, `plan.md`, `result.md`.
8. Не меняй согласованные требования или архитектуру скрыто в коде. Верни соответствующий task-документ в `черновик` и обнови зависимые документы.
9. Admin без auth предназначен только для локальной учебной среды.
10. Работай только в границах назначенной роли.
11. Статус `согласовано` ставится только после явного подтверждения пользователя или назначенного reviewer.

## Bootstrap новой сессии

1. Прочитай этот файл.
2. Проверь `git status`, текущую ветку и незавершённые изменения.
3. Получи `task-id` из запроса пользователя и найди `tasks/task-<task-id>/`.
4. Прочитай по порядку: `brief.md` → `adr.md` → `plan.md` → `result.md`.
5. Найди первый файл со `status: черновик` и продолжай с этого этапа по [`tasks/README.md`](tasks/README.md).
6. Открой только релевантные глобальные документы и файл нужного специализированного агента.
7. Во время реализации обновляй состояния пунктов в `plan.md`, а выполненное и проверки фиксируй в `result.md`.

Если создаётся новая задача, скопируй [`tasks/_template/`](tasks/_template/) в `tasks/task-<task-id>/`. Для пустого проекта начальная последовательность перечислена в [`tasks/README.md`](tasks/README.md) и начинается с [`tasks/task-000/`](tasks/task-000/).

## Что читать и когда

Каталоги `docs/`, `tasks/` и `.opencode/` не хранятся в git (см. `.gitignore`) и доступны только в локальной рабочей копии — ссылки ниже работают лишь там, где эти каталоги присутствуют.

| Файл | Когда читать |
|---|---|
| [`tasks/README.md`](tasks/README.md) | При каждом новом `task-id`; содержит lifecycle, статусы, зависимости, реестр задач и план разработки |
| [`docs/domain-rules.md`](docs/domain-rules.md) | При изменении onboarding, расписания, Event Type, Slot или Booking |
| [`docs/domain-model.md`](docs/domain-model.md) | При API, backend, database и QA design — сущности, VO, кардинальности, инварианты |
| [`docs/architecture.md`](docs/architecture.md) | При работе со структурой репозитория, границами компонентов, Docker или build/runtime |
| [`docs/sources-of-truth.md`](docs/sources-of-truth.md) | При конфликте задачи, глобальных правил, TypeSpec и реализации |
| [`docs/contract-pipeline.md`](docs/contract-pipeline.md) | При любом изменении TypeSpec, API или generated packages |
| [`docs/ui-spec-kit/README.md`](docs/ui-spec-kit/README.md) и [`MANUAL.md`](docs/ui-spec-kit/MANUAL.md) | Перед реализацией любого экрана owner-flow или guest-flow — UISpec является источником истины по внешнему виду, состояниям и токенам |
| [`README.md`](README.md) | Требования к окружению, установка, полный список команд и способы запуска |
| [`tests/contract-validation.test.ts`](tests/contract-validation.test.ts) | Перед изменением набора routes/операций контракта: gate сверяет их точный список |
| [`apps/client/AGENTS.md`](apps/client/AGENTS.md) | Перед работой с React Native / Web клиентом |
| [`apps/api/AGENTS.md`](apps/api/AGENTS.md) | Перед работой над backend — фреймворк, middleware, структура |
| [`tasks/_template/`](tasks/_template/) | Только при создании новой task-директории |

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
│       ├── AGENTS.md          требование читать версионированные docs Expo v57
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
│   │   ├── src/main.tsp                @service, @info(version), импорты
│   │   ├── src/models/                 common, errors, owner, event-type, booking
│   │   ├── src/operations/             health, admin, public
│   │   ├── tspconfig.yaml              эмиттер @typespec/openapi3 → generated/openapi.yaml
│   │   └── generated/openapi.yaml      фактически OpenAPI 3.0.0 (версия в конфиге не зафиксирована)
│   ├── api-client/            @minical/api-client — generated frontend SDK (@hey-api/client-fetch)
│   ├── backend-contract/      @minical/backend-contract — generated types + Zod schemas
│   ├── slot-engine/           .gitkeep — появится в отдельной задаче
│   └── database/              .gitkeep — schema и миграции, отдельная задача
├── tests/
│   └── contract-validation.test.ts   контрактный gate, запускается через `npm test`
├── infra/                     .gitkeep — Docker/Compose (`task-infra-001`)
├── docs/                      локальные документы AI-процесса, не в git
├── tasks/                     задачи AI-процесса, не в git
└── .opencode/                 роли и скиллы AI-процесса, не в git
```

`packages/slot-engine`, `packages/database` и `infra` — заявленные, но пустые каталоги. Не наполняй их код без задачи, которая это предусматривает.

### Пакеты и границы

| Пакет | Роль | Кто меняет |
|---|---|---|
| `@minical/contracts` | Ручной TypeSpec и производный OpenAPI | Contract Agent |
| `@minical/api-client` | Generated frontend SDK | никто вручную — только `npm run generate` |
| `@minical/backend-contract` | Generated transport types и runtime Zod-схемы | никто вручную — только `npm run generate` |
| `@minical/api` | REST, application logic, mapping transport ↔ domain ↔ persistence | Backend Agent |
| `@minical/client` | UI, навигация, состояния экранов по generated SDK | Frontend Agent |

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

tasks/
├── README.md                  lifecycle, статусы, реестр задач, план разработки
├── _template/                 brief.md, adr.md, plan.md, result.md
├── task-000/ … task-003/, task-006/     базовые задачи, старые id сохранены
├── task-contract-001/
├── task-infra-001/ … task-infra-005/
├── task-back-001/
├── task-front-ui-001/, task-front-ui-002/
├── task-front-guest-001/, task-front-guest-002/    (003…006 — сырьё слияния 2026-08-12, удаляются
│                               после согласования brief объединённой task-front-guest-002)
└── task-front-owner-001/

.opencode/
├── agents/                    роль-инструкции специализированных агентов
└── skills/                    brainstorming, decomposition, grill-me, grilling, lean-code,
                               uispec-generator, verification-before-completion,
                               worktree-isolated-agent
```

## Обязательные проверки (quality gates)

Набор ниже — фаза «Проверка» (**quality gates**) жизненного цикла задачи (все фазы — в [`tasks/README.md`](tasks/README.md), «Порядок работы»): когда все пункты `plan.md` завершены, полный набор прогоняется локально и результаты фиксируются в `result.md` («Выполненные проверки») — только после этого готовится MR. При завершении отдельного пункта `plan.md` полный прогон не требуется — достаточно гейтов затронутой области (см. аннотации у команд):

```bash
npm run contracts:format:check   # форматирование .tsp
npm run generate:check           # перегенерация + падение при diff в generated (защита от drift)
npm run typecheck                # tsc --noEmit по всем workspaces
npm test                         # контрактный gate
npm run uispec:validate          # валидация UISpec; обязательна при изменениях в docs/ui-spec-kit/ или UI-коде apps/client/, в клоне без docs/ шаг скипается
npm test -w @minical/api         # backend-гейт (node --test); обязателен при изменениях в apps/api/
npm test -w @minical/client      # клиентский гейт (jest + jest-expo); обязателен при изменениях в apps/client/
```

Корневой `npm test` — это `uispec:validate` плюс один Node-скрипт с `--experimental-strip-types`, отдельный тест выбрать нельзя. Тесты приложений в него не входят и запускаются своими командами: backend — `node --test` по `apps/api/src/**/*.test.ts` (можно выбрать файл: `node --test src/domain/slots.test.ts`), клиент — `jest` по `apps/client/src/**/*.test.ts(x)` (можно выбрать файл: `npx jest src/api/errors.test.ts` из `apps/client`). Полный список команд — в [`README.md`](README.md).

Тот же набор выполняет CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) на каждом PR в `main` и push в `main` — это страховка после push, а не замена фазы «Проверка»: в CI-клоне нет `docs/`, поэтому `uispec:validate` там штатно скипается, и зелёный CI не отменяет локальный полный прогон. На push в `main` [`release-please.yml`](.github/workflows/release-please.yml) ведёт release-PR.

## Специализированные агенты

| Роль | Задача в проекте | Инструкция |
|---|---|---|
| Contract Agent | TypeSpec-контракт и generation pipeline | [`contract-agent.md`](.opencode/agents/contract-agent.md) |
| Frontend Agent | React Native / Web UI по generated SDK и UISpec | [`frontend-agent.md`](.opencode/agents/frontend-agent.md) |
| Backend Agent | REST, application logic и Slot Engine | [`backend-agent.md`](.opencode/agents/backend-agent.md) |
| Database Agent | PostgreSQL schema, migrations и constraints | [`database-agent.md`](.opencode/agents/database-agent.md) |
| QA Agent | Контрактные, доменные, интеграционные и E2E-проверки | [`qa-agent.md`](.opencode/agents/qa-agent.md) |
| Infrastructure Agent | Toolchain, Docker, Compose, CI и Android builder | [`infrastructure-agent.md`](.opencode/agents/infrastructure-agent.md) |

Harness не имеет отдельного role-файла: он следует `AGENTS.md`, lifecycle активной задачи и подключает специализированные роли по необходимости.

### Как роли, скиллы и MCP попадают в сессию

Проектные инструкции физически лежат в `.opencode/`, и разные харнессы видят их по-разному. Не рассчитывай на автоподхват — проверяй по этой таблице:

| Артефакт | OpenCode | Claude Code |
|---|---|---|
| `.opencode/agents/*.md` — 6 ролей | автоматически как agents | **не подхватываются**: нет frontmatter и нет `.claude/agents/`. Читать как обычный Markdown по путям из таблицы выше |
| `.opencode/skills/*/SKILL.md` — 8 скиллов; `scripts/` у `uispec-generator` — симлинк на `docs/ui-spec-kit/tools/uispec` (канон скриптов один, копии нет) | автоматически как skills | подхватываются через симлинк `.claude/skills → ../.opencode/skills` — проверено на живой сессии. Без симлинка `SKILL.md` читается как Markdown |
| `.mcp.json` в корне — канонический реестр MCP-серверов (формат `mcpServers`) | **не читается** (feature request закрыт как not planned): у OpenCode свой формат — секция `mcp` в `opencode.json`, записи зеркалирует владелец вручную | подхватывается автоматически как project-scope MCP; первое использование сервера требует одобрения пользователя |

Практические следствия:

- вызов роли — это «прочитай `.opencode/agents/<role>.md` и работай в его границах», а не переключение агента;
- «обязательный скилл» в role-файле означает обязательный *процесс* из `SKILL.md`; выполнить его вручную по шагам — полноценное соблюдение правила;
- `grill-me` помечен `disable-model-invocation: true`, поэтому в модельном списке скиллов его нет и агент сам его не вызовет — он запускается только пользователем через `/grill-me`. Остальные семь доступны агенту;
- `.claude/` и `.opencode/` не хранятся в git, поэтому в свежем клоне нет ни ролей, ни скиллов, ни симлинков — их восстанавливает владелец рабочей копии;
- MCP-серверы описываются только в `.mcp.json` — это единственный источник правды; зеркало в `opencode.json` обновляется следом за ним. Оба файла в `.gitignore` (внутри могут быть локальные пути и env-секреты), свежий клон MCP-серверов не получает;
- при добавлении новой роли, скилла или MCP-сервера обнови таблицы в этом файле: манифеста, который бы их перечислял, нет — единственный реестр здесь.

## Generated: read-only

```text
packages/contracts/generated/**
packages/api-client/src/generated/**
packages/backend-contract/src/generated/**
```
