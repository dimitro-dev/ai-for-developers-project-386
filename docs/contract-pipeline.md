# TypeSpec contract pipeline

## Цель

Обеспечить один ручной HTTP-контракт и независимую работу frontend и backend.

```text
согласованный brief + adr активной задачи
    ▼
Contract Agent меняет TypeSpec
    ▼
TypeSpec compiler
    ▼
OpenAPI 3.1
    ├── frontend types + fetch SDK
    └── backend types + runtime schemas
    ▼
Frontend и backend реализуются параллельно
```

## Ручной источник контракта

Редактируется только:

```text
packages/contracts/src/**/*.tsp
```

TypeSpec описывает:

- operation name;
- HTTP method и route;
- path, query и header parameters;
- request и response models;
- status codes;
- стабильные error codes;
- transport-level validation и примеры.

TypeSpec не описывает:

- алгоритм слотов;
- транзакции;
- PostgreSQL schema и migrations;
- exclusion constraint;
- domain entities;
- UI и Docker runtime.

## Генерационная цепочка

Принятый pipeline:

```text
@typespec/openapi3
    TypeSpec → OpenAPI 3.1

@hey-api/openapi-ts
    OpenAPI → frontend TypeScript SDK
    OpenAPI → backend TypeScript types и Zod schemas
```

Целевые артефакты:

```text
packages/contracts/generated/openapi.yaml
packages/api-client/src/generated/**
packages/backend-contract/src/generated/**
```

Они read-only и должны воспроизводиться одной корневой командой.

## Ожидаемые команды

После scaffold в корневом `package.json` должны существовать:

```bash
npm run contracts:format
npm run contracts:format:check
npm run contracts:build
npm run generate
npm run generate:check
```

Смысл `npm run generate`:

```text
TypeSpec → OpenAPI → frontend SDK → backend schemas
```

`generate:check` повторяет генерацию и падает, если появился незакоммиченный generated diff.

## Порядок изменения API

1. Убедиться, что `brief.md` и `adr.md` активной задачи согласованы, а API impact отражён в `plan.md`.
2. Contract Agent изменяет `.tsp`.
3. Запустить formatter и TypeSpec compile.
4. Перегенерировать OpenAPI, frontend SDK и backend schemas.
5. Просмотреть generated diff и определить breaking changes.
6. Обновить состояние contract-пункта в `plan.md`.
7. Только после этого запускать Frontend и Backend Agent.
8. QA проверяет реальные responses против контракта.

Если HTTP API не меняется, Contract Agent не нужен.

## Правила generated API

- operation names должны быть стабильными: они могут влиять на имена SDK-функций;
- frontend не создаёт ручные копии DTO и не пишет обходные URL;
- backend валидирует runtime input generated-схемами на transport boundary;
- generated TypeScript types не заменяют runtime validation;
- ORM и миграции не генерируются слепо из API DTO.

## Независимая разработка

Frontend Agent может работать по generated SDK и mock API до готовности backend.

Backend Agent использует тот же контракт, но отдельно реализует:

- application services;
- slot engine;
- repositories;
- транзакции и database constraints;
- mapping между transport, domain и persistence.

## Изменение, обнаруженное во время реализации

Implementation Agent не редактирует TypeSpec самостоятельно. Он фиксирует блокирующее изменение в `plan.md` активной задачи и передаёт contract-пункт Contract Agent. Если изменение влияет на согласованный scope или архитектуру, применяются правила возврата task-документов в `черновик` из `tasks/README.md`.
