---
status: черновик
---

# Architecture decision — TASK-002

## Контекст

Нужен единый API-first контракт, который можно использовать для параллельной разработки React Native/Web и backend.

## Решение

1. Хранить ручной контракт в `packages/contracts/src/**/*.tsp`.
2. Использовать OpenAPI 3.1 как generated промежуточное представление.
3. Генерировать frontend fetch SDK/types и backend transport types/runtime schemas из одного OpenAPI.
4. Организовать TypeSpec по `models/` и `operations/`, оставив `main.tsp` точкой сборки сервиса.
5. Разделить admin и public operations namespace/route-группами, не трактуя `/admin` как security boundary.
6. Выражать transport constraints в TypeSpec, а доменные проверки времени и пересечений оставлять backend/Slot Engine.
7. Не генерировать database schema или domain aggregates из TypeSpec.

## Затронутые компоненты

```text
packages/contracts/src/**
packages/contracts/generated/**
packages/api-client/src/generated/**
packages/backend-contract/src/generated/**
root generation scripts — только при необходимости
```

## Последствия и компромиссы

Положительные:

- frontend и backend используют одну форму API;
- изменения контракта видны как generated diff;
- mock и contract validation можно выполнять до backend implementation;
- transport validation отделена от domain logic.

Ограничения:

- TypeSpec не проверяет, что backend реально соблюдает 14-дневное окно и запрет пересечений;
- operation rename может быть breaking change для generated SDK;
- некоторые domain errors требуют явного mapping и не выводятся автоматически из моделей.

## Рассмотренные альтернативы

### Ручной OpenAPI YAML

Отклонён из-за громоздкости и риска рассинхронизации.

### Написать frontend/backend DTO вручную

Отклонено: появляются параллельные несовпадающие источники правды.

### Генерировать ORM из OpenAPI

Отклонено: transport и persistence имеют разные задачи.

## Совместимость и миграция

Это первый продуктовый контракт. Smoke-операции bootstrap-задачи удаляются или заменяются; общая команда generation должна сохраниться.
