# AGENTS.md — MiniCal

Короткая точка входа для новой AI-сессии. Сначала найди активную задачу, затем загружай только связанные документы и инструкцию нужной роли.

## Проект

MiniCal — учебный сервис бронирования без регистрации и авторизации:

- единый React Native / React Web клиент: Android и web обязательны, iOS проверяется локально на macOS при доступном toolchain;
- REST backend — источник истины для настроек календаря, слотов и бронирований;
- PostgreSQL — постоянное состояние и защита бизнес-инвариантов;
- Docker Compose — локальный runtime; отдельный Docker builder собирает Android APK.

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

| Файл | Когда читать |
|---|---|
| [`tasks/README.md`](tasks/README.md) | При каждом новом `task-id`; содержит lifecycle, статусы, зависимости и начальный каталог задач |
| [`docs/domain-rules.md`](docs/domain-rules.md) | При изменении onboarding, расписания, Event Type, Slot или Booking |
| [`docs/architecture.md`](docs/architecture.md) | При работе со структурой репозитория, границами компонентов, Docker или build/runtime |
| [`docs/sources-of-truth.md`](docs/sources-of-truth.md) | При конфликте задачи, глобальных правил, TypeSpec и реализации |
| [`docs/contract-pipeline.md`](docs/contract-pipeline.md) | При любом изменении TypeSpec, API или generated packages |
| `docs/domain-model.md` | После создания задачей `001`; читать при API, backend, database и QA design |
| [`tasks/_template/`](tasks/_template/) | Только при создании новой task-директории |
| [`agents/`](agents/) | Перед выполнением работы конкретной специализированной роли |

## Специализированные агенты

| Роль | Задача в проекте | Инструкция |
|---|---|---|
| Contract Agent | TypeSpec-контракт и generation pipeline | [`agents/contract-agent.md`](agents/contract-agent.md) |
| Frontend Agent | React Native / Web UI по generated SDK | [`agents/frontend-agent.md`](agents/frontend-agent.md) |
| Backend Agent | REST, application logic и Slot Engine | [`agents/backend-agent.md`](agents/backend-agent.md) |
| Database Agent | PostgreSQL schema, migrations и constraints | [`agents/database-agent.md`](agents/database-agent.md) |
| QA Agent | Контрактные, доменные, интеграционные и E2E-проверки | [`agents/qa-agent.md`](agents/qa-agent.md) |
| Infrastructure Agent | Toolchain, Docker, Compose, CI и Android builder | [`agents/infrastructure-agent.md`](agents/infrastructure-agent.md) |

Harness не имеет отдельного role-файла: он следует `AGENTS.md`, lifecycle активной задачи и подключает специализированные роли по необходимости.

## Generated: read-only

```text
packages/contracts/generated/**
packages/api-client/src/generated/**
packages/backend-contract/src/generated/**
```
