# @minical/database — PostgreSQL

Зона `packages/database/` отвечает за PostgreSQL schema, migrations, constraints, seed
и persistence-уровень. Каталог пока пуст (`.gitkeep`) — зона активируется задачей `back/002`: до неё
вся занятость держится в in-memory хранилище backend-а, и exclusion constraint как последняя защита
от гонки отсутствует. Это известное ограничение, а не недоработка; код без задачи, которая это
предусматривает, здесь не появляется.

## Читать

```text
корневой AGENTS.md
согласованные документы активной задачи (гейты — в её task.yaml; см. tasks/AGENTS.md)
plan.md активной задачи
docs/domain-rules.md
docs/domain-model.md — сущности, VO, кардинальности и инварианты
docs/architecture.md
infra/README.md — как поднять локальный контур PostgreSQL и сбросить его данные
```

## Разрешено менять

```text
packages/database/**
database migrations
repositories persistence-уровня — совместно с зоной apps/api/, если код лежит в apps/api/**
database integration/concurrency tests
состояние своего пункта в plan.md
database-раздел активного result.md
```

## Обязан

- хранить migrations в репозитории;
- обеспечивать уникальность публичного `EventType.id`;
- хранить конкретные встречи как UTC timestamps;
- сохранять guest data как snapshot Booking;
- реализовать глобальный запрет пересекающихся активных Booking;
- использовать foreign keys и явные check constraints;
- обеспечить воспроизводимый seed, если он входит в задачу;
- проверить ограничения реальной PostgreSQL integration test-ом.

## Запрещено

- менять TypeSpec или HTTP-контракт;
- генерировать таблицы слепо из API DTO;
- заменять database constraint только прикладной проверкой;
- удалять или сдвигать существующие Booking при изменении расписания;
- скрывать destructive migration без решения в ADR задачи;
- ставить `согласовано` самовольно: правило 11 корневого [`AGENTS.md`](../../AGENTS.md), фиксация —
  только `scripts/task approve` после явного подтверждения владельца.

## При недостающем решении

Если доменный инвариант, способ его защиты или граница persistence не определены в согласованных
документах активной задачи — не подменяй решение догадкой. Зафиксируй блокирующий пункт в `plan.md`
и верни соответствующий гейт в `черновик`: `scripts/task draft <id> <гейт>`, правила каскада —
в [`tasks/flows/full.md`](../../tasks/flows/full.md), иерархия источников правды —
в `docs/sources-of-truth.md`.

## Definition of Done

- migration применяется на чистой БД;
- migration имеет понятный forward/rollback plan в рамках выбранного инструмента;
- constraints защищают заявленные инварианты;
- concurrency test подтверждает отсутствие двойной брони — на реальной PostgreSQL, а не на mock-е;
  команда запуска указывается в `result.md`;
- repository API согласован с зоной [`apps/api/`](../../apps/api/AGENTS.md);
- пункт плана и database-раздел `result.md` обновлены.
