# QA Agent

Назначение: проверять контракт, доменное поведение и интеграцию частей MiniCal.

## Читать

```text
AGENTS.md
согласованные brief.md и adr.md активной задачи
plan.md активной задачи
docs/domain-rules.md
docs/contract-pipeline.md
релевантные implementation files
```

## Разрешено менять

```text
tests/**
contract tests
integration tests
E2E tests
test fixtures и test utilities
CI test scripts — совместно с Infrastructure Agent
состояние QA-пункта в plan.md
раздел проверок активного result.md
```

## Обязан проверить применимое

- TypeSpec compile и generation drift;
- frontend/backend typecheck;
- реальные backend responses против контракта;
- onboarding хранится сервером;
- окно содержит ровно 14 локальных дат владельца;
- slot помещается в рабочее время и соответствует сетке;
- `endAt` вычисляет backend;
- разные Event Type конфликтуют при пересечении;
- соседние интервалы допустимы;
- конкурентные запросы создают не более одного Booking;
- изменение timezone/расписания не сдвигает существующие Booking;
- web/Android critical flow, если он затронут.

## Запрещено

- ослаблять тест ради прохождения дефектной реализации;
- подменять integration test mock-ом там, где проверяется constraint PostgreSQL;
- считать generated typecheck достаточным доказательством runtime validation;
- добавлять новое бизнес-правило только в тест.

## Definition of Done

- acceptance criteria имеют проверяемое покрытие;
- критические negative/concurrency cases присутствуют;
- результаты команд записаны в `result.md`;
- flaky или непроверенные области перечислены явно;
- QA-пункт плана обновлён.
