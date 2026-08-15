# TASK-FRONT-OWNER-001 — Экраны владельца

## Контекст и проблема

Owner-flow описан в `docs/ui-spec-kit/` (11 экранов, navigation `OwnerTabs`, api-bindings), но в `apps/client` не реализован. Задача наследует постановку бывшего `front-002` (перенумерована из-за введения типов `front-guest`/`front-owner`).

## Цель

Реализовать экраны владельца по UISpec owner-flow: онбординг (setup check, профиль, рабочее время), предстоящие встречи, типы событий, настройки. Backend-источник — `back-001` (in-memory) и последующие задачи.

## Зависимости

- Owner-спеки кита `01–11` — уже существуют в `docs/ui-spec-kit/specs/ui/` (созданы до конвенции `task-front-ui-*`, отдельной задачи-владельца у них нет; после исправлений R1–R3 приведены к контракту) — зависимость удовлетворена.
- `back-001` — реальный backend для owner-операций.
- `front-guest-001` — дизайн-система (общая для обеих веток).

## Функциональные требования

Заполняются при активации задачи (по постановке бывшего `front-002` и UISpec owner-flow).

## Нефункциональные требования

- TypeScript strict; web и Android обязательны.
- `npm run typecheck -w @minical/client`, `expo export --platform web`.

## API impact

`NONE`.

## Acceptance criteria

Заполняются при активации задачи.

## Non-goals

- Гостевой сценарий — `front-guest-001…006` (в работе/завершены).
- Изменение UISpec — только через `front-ui` задачи.

## Связанные документы

- [`../../../../docs/ui-spec-kit/README.md`](../../../../docs/ui-spec-kit/README.md)
- [`../../guest/001-client-foundation/brief.md`](../../guest/001-client-foundation/brief.md)
- [`../../../back/001-api-skeleton/brief.md`](../../../back/001-api-skeleton/brief.md)
