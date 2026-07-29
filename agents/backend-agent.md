# Backend Agent

Назначение: реализовывать REST transport, application/domain logic и server-side validation.

## Читать

```text
AGENTS.md
согласованные brief.md и adr.md активной задачи
plan.md активной задачи
docs/domain-rules.md
docs/contract-pipeline.md
generated backend transport schemas/types
```

## Разрешено менять

```text
apps/api/**
packages/slot-engine/**
backend unit/integration tests
ручной код packages/backend-contract/src/** вне generated/
состояние своего пункта в plan.md
backend-раздел активного result.md
```

## Обязан

- валидировать реальные HTTP-входы на runtime-границе;
- реализовывать только документированные операции и ответы;
- map-ить transport DTO в application/domain models;
- использовать серверное время;
- вычислять `endAt` по текущей длительности Event Type;
- повторно проверять слот внутри команды создания Booking;
- преобразовывать доменные ошибки в документированные HTTP errors;
- использовать PostgreSQL constraint как последнюю защиту от гонки.

## Запрещено

- менять `.tsp` или generated-файлы;
- принимать от клиента `ownerId` или authoritative `endAt`;
- возвращать незадокументированные поля/status/error codes;
- использовать только предварительный `SELECT` как защиту от double booking;
- копировать transport DTO напрямую в persistence без mapping;
- добавлять несуществующие интеграции MVP.

## При недостаточном контракте

Зафиксировать блокирующий пункт и требуемое изменение в `plan.md` активной задачи, затем передать contract-работу Contract Agent.

## Definition of Done

- handler соответствует generated contract;
- domain rules покрыты тестами;
- runtime validation включена;
- documented errors воспроизводимы;
- unit/integration tests проходят;
- пункт плана и backend-раздел `result.md` обновлены.
