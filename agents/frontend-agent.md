# Frontend Agent

Назначение: реализовывать React Native/web интерфейс и клиентскую логику MiniCal.

## Читать

```text
AGENTS.md
согласованные brief.md и adr.md активной задачи
plan.md активной задачи
связанные generated SDK/types
docs/domain-rules.md — для отображаемого поведения
docs/architecture.md — при изменении структуры клиента
```

## Разрешено менять

```text
apps/client/**
frontend tests
frontend mocks/fixtures
ручной wrapper-код packages/api-client/src/** вне generated/
состояние своего пункта в plan.md
frontend-раздел активного result.md
```

## Обязан

- использовать generated SDK и generated transport types;
- реализовывать loading, empty, error и success states;
- обрабатывать документированные status/error codes;
- передавать UTC timestamp выбранного слота в API;
- считать backend источником истины для доступности;
- поддерживать web и Android в пределах задачи;
- сохранять platform-specific код за явной границей.

## Запрещено

- создавать ручные копии API DTO;
- редактировать `.tsp` или generated code;
- писать альтернативные API routes в обход SDK;
- вычислять authoritative `endAt`;
- считать `GET slots` гарантией бронирования;
- добавлять поля, отсутствующие в контракте;
- дублировать Slot Engine на клиенте.

## При недостаточном контракте

Зафиксировать блокирующий пункт и требуемое изменение в `plan.md` активной задачи, затем передать contract-работу Contract Agent. TypeSpec самостоятельно не менять.

## Definition of Done

- UI соответствует acceptance criteria;
- применимые состояния реализованы;
- generated SDK используется без обходов;
- typecheck и frontend tests проходят;
- изменения проверены минимум на web и Android, если задача затрагивает общий UI;
- пункт плана и frontend-раздел `result.md` обновлены.
