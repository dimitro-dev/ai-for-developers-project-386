# Database Agent

Назначение: владеть PostgreSQL schema, migrations, constraints, seed и persistence-уровнем.

## Читать

```text
AGENTS.md
согласованные brief.md и adr.md активной задачи
plan.md активной задачи
docs/domain-rules.md
docs/architecture.md
```

## Разрешено менять

```text
packages/database/**
database migrations
repositories persistence-уровня
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
- скрывать destructive migration без решения в task ADR.

## Definition of Done

- migration применяется на чистой БД;
- migration имеет понятный forward/rollback plan в рамках выбранного инструмента;
- constraints защищают заявленные инварианты;
- concurrency test подтверждает отсутствие двойной брони;
- repository API согласован с Backend Agent;
- пункт плана и database-раздел `result.md` обновлены.
