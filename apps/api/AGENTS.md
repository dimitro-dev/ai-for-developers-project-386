# MiniCal API Server

REST-backend MiniCal: все 12 операций контракта поверх in-memory хранилища, порт `3001` по
умолчанию. Реализовано задачей `task-back-001`; PostgreSQL, миграции и exclusion constraint —
отдельная задача Database Agent, security middleware (CORS, helmet, лимит тела) — `task-infra-003`.

Роль и её границы — в [`backend-agent.md`](../../.opencode/agents/backend-agent.md) (файл доступен
только локально, не хранится в git).

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
`export type` и в рантайме пуст (`task-infra-005`). Самописных схем нет. Порядок — транспорт, затем
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

Вне контракта отдаются только `404 NOT_FOUND` (неизвестный URL или метод) и `500 INTERNAL_ERROR` —
ситуации, которых контракт не описывает; форма `ErrorResponse` соблюдена.

## Middleware и место для `task-infra-003`

Единственная точка вставки — начало `createApp`, до цикла монтирования маршрутов. `express.json()`
взят с дефолтами (в т. ч. лимит 100kb): это не решение о лимите, а его отсутствие.

## Команды

```bash
npm run dev -w @minical/api        # node --watch src/server.ts
npm start -w @minical/api          # node src/server.ts, без предварительной сборки
npm test -w @minical/api           # node --test: 64 теста, 4 файла
npm run typecheck -w @minical/api  # tsc --noEmit — единственный типовой гейт
```

Тесты: `src/http/routes.contract.test.ts` (покрытие контракта 12/12), `src/domain/slots.test.ts`
(таймзоны, окно, сетка, пересечения), `src/store/memory.test.ts` (атомарность `create`, копии
записей), `src/api.test.ts` (HTTP-сценарии, тела ответов сверяются generated response-схемами).
Раннер — встроенный `node:test`, HTTP-тесты поднимают `createApp(deps)` на `listen(0)` и обращаются
глобальным `fetch`: ни `supertest`, ни внешнего раннера в зависимостях нет.

## Запуск из исходников: ограничения strip-only

Сборки нет — `node src/server.ts` исполняет TypeScript напрямую, `tsconfig.json` стоит на `noEmit`
плюс `allowImportingTsExtensions`. Из этого следуют обязательные к соблюдению правила:

- у всех относительных импортов явное расширение `.ts`;
- нет `enum` — только `as const` и union-типы;
- нет parameter properties (поля класса присваиваются явно), `namespace` с рантайм-значением и
  декораторов;
- импорты только типов — через `import type`;
- зависимости ставятся в корне репозитория с сохранением симлинков npm workspaces: внутри
  физического `node_modules` Node отказывается стриптить типы
  (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`). Это требование к будущему Docker-образу.

`npm run typecheck` — единственное место, где типы действительно проверяются.
