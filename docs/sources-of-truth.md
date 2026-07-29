# Источники правды MiniCal

Каждый артефакт является источником правды только для своей области. Документ task-директории со статусом `черновик` является рабочей гипотезой, а не принятым решением.

| Область | Источник правды |
|---|---|
| Scope, сценарии и acceptance criteria конкретной задачи | согласованный `tasks/task-<task-id>/brief.md` |
| Архитектурное решение конкретной задачи | согласованный `tasks/task-<task-id>/adr.md` |
| Декомпозиция и текущее состояние выполнения | `tasks/task-<task-id>/plan.md` |
| Фактический результат и описание MR | `tasks/task-<task-id>/result.md` |
| Общие правила onboarding, расписания, слотов и Booking | `docs/domain-rules.md` |
| Базовый архитектурный контур и границы компонентов | `docs/architecture.md` |
| HTTP routes, transport models, statuses и errors | `packages/contracts/src/**/*.tsp` |
| Машинное представление HTTP-контракта | `packages/contracts/generated/openapi.yaml` |
| Frontend API types и SDK | `packages/api-client/src/generated/**` |
| Backend transport types и runtime schemas | `packages/backend-contract/src/generated/**` |
| Реализация slot engine и application rules | `packages/slot-engine/` и `apps/api/` |
| Физическая модель PostgreSQL | `packages/database/` и миграции |
| Локальный runtime и build | `infra/`, Dockerfiles и Compose |
| Проверяемое поведение | tests плюс acceptance criteria активной задачи |

## Иерархия при конфликте

1. Явное актуальное решение пользователя.
2. Согласованный `brief.md` активной задачи.
3. Согласованный `adr.md` активной задачи.
4. Общие `docs/domain-rules.md` и `docs/architecture.md`, если задача явно их не изменяет.
5. TypeSpec-контракт.
6. Реализация.

`plan.md` задаёт порядок реализации, но не может незаметно менять scope или архитектуру. `result.md` фиксирует фактическое выполнение, но расхождение результата с согласованными `brief.md` или `adr.md` является дефектом, а не новым правилом.

## Производные артефакты

Не редактируются вручную:

```text
packages/contracts/generated/**
packages/api-client/src/generated/**
packages/backend-contract/src/generated/**
```

OpenAPI — производное представление TypeSpec, а не отдельный ручной источник.

## Разделение моделей

Не отождествляй:

```text
HTTP DTO
Domain model
Persistence model
```

Пример:

```text
CreateBookingRequest  — transport input
BookingCommand        — application command
Booking               — domain entity
bookings row          — persistence record
BookingResponse       — transport output
```

Если нужного решения нет, не подменяй его догадкой: верни соответствующий task-документ в `черновик` и зафиксируй решение там.
