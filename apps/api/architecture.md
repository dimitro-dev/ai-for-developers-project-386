# apps/api — устройство зоны

REST-backend MiniCal: все 12 операций контракта поверх in-memory хранилища. Реализовано задачей
`back/001`, middleware-цепочка (CORS, security-заголовки, лимит тела) — `infra/003`; PostgreSQL,
миграции и exclusion constraint — задача `back/002` в зоне
[`packages/database/`](../../packages/database/AGENTS.md).

Правила зоны — [`AGENTS.md`](AGENTS.md), запуск и переменные окружения — [`README.md`](README.md).

## Фреймворк: Express 5 без схемной машинерии

Контракт живёт в `packages/contracts/src/**/*.tsp` и уже сгенерирован в OpenAPI и Zod, поэтому от
фреймворка нужны только маршрутизация и middleware-цепочка. Инструменты, порождающие OpenAPI **из**
кода (`@fastify/swagger` и производные), создали бы второй источник правды о контракте и нарушили
правила 5 и 6 корневого `AGENTS.md`. Валидация выполняется явным вызовом generated-схем.

Рантайм-зависимости: `express`, `zod`, `@minical/backend-contract`. Сборочного шага нет.

## Слои и правила границ

```text
src/
├── server.ts                 entry: loadConfig() → createMemoryStore() → createApp(deps) → listen
├── config.ts                 PORT, PUBLIC_WEB_URL; мусорное значение = отказ старта
├── app.ts                    createApp(deps): express.json() → цикл по ROUTES → 404 → error-middleware
├── http/
│   ├── routes.ts             ROUTES — реестр 12 операций (данные) и тип OperationId
│   ├── handlers.ts           handlers: Record<OperationId, (deps) => RequestHandler>, Deps
│   ├── parse.ts              parseOrThrow(schema, value) → VALIDATION_ERROR
│   ├── present.ts            domain → transport DTO, Date → ISO, publicUrl из конфигурации
│   └── errors.ts             ERROR_STATUS, errorMiddleware, notFoundHandler
├── usecases/
│   ├── owner.ts              setup, settings, event types, upcoming bookings, публичный профиль
│   └── booking.ts            getPublicSlots, createPublicBooking
├── domain/
│   ├── model.ts              доменные типы и VO
│   ├── errors.ts             DomainError + union DomainErrorCode
│   ├── slots.ts              чистый slot engine: окно, сетка, пересечения
│   └── timezone.ts           Intl-примитивы: localPartsOf, instantOfLocal, isValidTimeZone
└── store/
    ├── repositories.ts       интерфейсы Owner/EventType/Booking + Store
    └── memory.ts             in-memory реализация (createMemoryStore)
```

- `domain/**` не импортирует `express`, `@minical/backend-contract` и `store/**` — только `node:*` и
  собственные модули. Это условие дешёвого выноса slot-логики в `packages/slot-engine`.
- `usecases/**` знают домен и интерфейсы репозиториев, но не знают `express`: ни `req`, ни `res`, ни
  статусов.
- `http/**` — единственное место, где живёт transport: Zod-схемы, статусы, сериализация.
- `store/**` реализует интерфейсы и наружу больше ничего не отдаёт. Переход на PostgreSQL меняет
  `store/memory.ts` → `store/postgres.ts` плюс одну строку сборки `deps` в `server.ts`.

## Валидация входа — одна точка

`parseOrThrow(schema, value)` в обработчике, схемы только **операционные** и только generated:

```ts
import { zCreatePublicBookingBody, zGetPublicSlotsQuery } from '@minical/backend-contract/zod';
import type { CreateBookingRequest, ErrorResponse } from '@minical/backend-contract';
```

Схемы приходят подпутём `/zod`, типы — корневым входом: generated `index.ts` состоит из одного
`export type` и в рантайме пуст (`infra/005`). Самописных схем нет. Порядок — транспорт, затем
домен: доменный код работает с уже разобранными значениями.

Доменные проверки сверх схемы (в `usecases/owner.ts`): кратность `slotIntervalMinutes` числу 60,
`startLocal < endLocal`, непустой `daysOfWeek`, существование зоны в ICU. Первое и последнее
keyword'ами OpenAPI 3.0 не выражаются, без них мусорные настройки обрушают `getPublicSlots`.

## Ошибки — одна таблица

`ERROR_STATUS` в `http/errors.ts` — единственное место, где доменный код превращается в статус;
типизирована `satisfies Record<DomainErrorCode, number>`, поэтому код без статуса добавить нельзя.
Домен бросает `DomainError(code, message)`, error-middleware отвечает `{code, message}` — форма
`ErrorResponse`. Express 5 сам доводит отказ промиса async-обработчика до error-middleware, обёрток
вида `asyncHandler` нет.

Вне контракта отдаются только `404 NOT_FOUND` (неизвестный URL или метод), `500 INTERNAL_ERROR` и
`413 PAYLOAD_TOO_LARGE` (превышение лимита тела, `infra/003`) — ситуации, которых контракт не
описывает; форма `ErrorResponse` соблюдена. Статус этих трёх ответов берётся не из `ERROR_STATUS`:
их коды не входят в `DomainErrorCode`, потому что домен об ограничениях транспорта не знает.

## Middleware-цепочка

Единственная точка вставки — начало `createApp`, до цикла монтирования маршрутов. Порядок значим:

```text
securityHeaders                            X-Content-Type-Options: nosniff, X-Frame-Options: DENY
cors                                       Access-Control-Allow-Origin: * на всех ответах;
                                           OPTIONS → 204 + Allow-Methods (выводятся из ROUTES)
                                           + Allow-Headers: Content-Type
express.json({ limit: BODY_LIMIT_BYTES })  64KB; превышение → 413 PAYLOAD_TOO_LARGE
цикл по ROUTES → notFoundHandler → errorMiddleware
```

Заголовки стоят до парсера тела не случайно: иначе ответ `413` уйдёт без
`Access-Control-Allow-Origin` и браузер не даст клиенту прочитать даже код ошибки.

CORS и security-заголовки живут в `http/security.ts` и реализованы без пакетов `cors` и `helmet`:
при статическом `*` из них не используется ничего, кроме трёх константных заголовков.
`Access-Control-Allow-Origin: *` допустимо только для локальной учебной среды. Список методов
preflight выводится из реестра `ROUTES`, поэтому не может отстать от контракта; `OPTIONS` замыкается
в middleware, из-за чего `Allow` не отдаётся, а `OPTIONS` на неизвестный URL отвечает `204` (сам
запрос по тому же URL по-прежнему получает `404`).

Лимит тела объявлен один раз — `BODY_LIMIT_BYTES` в `http/security.ts` — и действует на тела с
`Content-Type: application/json`, единственный тип запросов в контракте. Тело другого типа
`express.json()` не читает вовсе: оно не попадает в память приложения, но и `413` не получает —
обработчик увидит пустое тело и вернёт `400 VALIDATION_ERROR`.

## Тесты зоны

Тесты лежат рядом с кодом: `src/http/routes.contract.test.ts` (покрытие контракта 12/12),
`src/domain/slots.test.ts` (таймзоны, окно, сетка, пересечения), `src/store/memory.test.ts`
(атомарность `create`, копии записей), `src/api.test.ts` (HTTP-сценарии, тела ответов сверяются
generated response-схемами), `src/http/security.test.ts` (CORS, preflight, security-заголовки,
лимит тела) — 71 тест в 5 файлах.

Раннер — встроенный `node:test`, HTTP-тесты поднимают `createApp(deps)` на `listen(0)` и обращаются
глобальным `fetch`: ни `supertest`, ни внешнего раннера в зависимостях нет. Запуск — цель `test`
зоны (см. [`README.md`](README.md)).

## Запуск из исходников: ограничения strip-only

Сборки нет — Node исполняет TypeScript-исходники напрямую, `tsconfig.json` стоит на `noEmit` плюс
`allowImportingTsExtensions`. Из этого следуют обязательные к соблюдению правила:

- у всех относительных импортов явное расширение `.ts`;
- нет `enum` — только `as const` и union-типы;
- нет parameter properties (поля класса присваиваются явно), `namespace` с рантайм-значением и
  декораторов;
- импорты только типов — через `import type`;
- зависимости ставятся в корне репозитория с сохранением симлинков npm workspaces: внутри
  физического `node_modules` Node отказывается стриптить типы
  (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`). Это требование к будущему Docker-образу.

Цель `typecheck` зоны — единственное место, где типы действительно проверяются.
