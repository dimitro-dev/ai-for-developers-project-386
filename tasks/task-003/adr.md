---
status: черновик
---

# Architecture decision — TASK-003

## Контекст

Перед implementation нужна проверяемая граница, показывающая, что API-контракт достаточен для пользовательских сценариев, но не подменяющая backend/domain tests.

## Решение

1. Использовать сценарную traceability matrix как основной метод проверки полноты.
2. Проверять одновременно TypeSpec source, generated OpenAPI и generated TypeScript packages.
3. Выполнять compile/generation/typecheck и, при наличии, mock smoke.
4. Явно разделить:
   - contract guarantees — формы запросов/ответов, routes, statuses;
   - implementation guarantees — 14-дневное вычисление, server recheck, отсутствие пересечений.
5. При блокирующем gap возвращать `002` на доработку вместо локального обхода.

## Затронутые компоненты

```text
tasks/task-003/result.md
contract validation scripts/tests — если предусмотрены plan
packages/contracts/generated/openapi.yaml
packages/api-client/src/generated/**
packages/backend-contract/src/generated/**
```

## Последствия и компромиссы

Положительные:

- frontend/backend не стартуют по неполному контракту;
- пробелы обнаруживаются до дорогой реализации;
- отчёт отделяет schema coverage от бизнес-корректности.

Ограничения:

- mock server не доказывает работу реального backend;
- OpenAPI не может выразить все временные и конкурентные инварианты;
- traceability требует ручной семантической проверки.

## Рассмотренные альтернативы

### Считать `tsp compile` достаточной проверкой

Отклонено: компилятор не знает пользовательские сценарии.

### Проверять контракт только после реализации

Отклонено: теряется преимущество независимой разработки frontend/backend.

### Исправлять gaps непосредственно QA Agent

Отклонено: ownership TypeSpec остаётся у Contract Agent и task lifecycle.

## Совместимость и миграция

Изменений runtime нет. Если QA обнаруживает gap, соответствующие документы `002` возвращаются в `черновик`, generated artifacts обновляются и проверка повторяется.
