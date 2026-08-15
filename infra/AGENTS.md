# infra — build, runtime и CI

Зона Infrastructure Agent: обеспечить воспроизводимый build, локальный runtime, Android artifact и
CI-интерфейс проекта.

Каталог пока пуст (`.gitkeep`) — зона активируется задачей `infra/001` (PostgreSQL и Docker
Compose); Android builder — `infra/002`. Код без задачи, которая это предусматривает, здесь не
появляется.

## Читать

```text
корневой AGENTS.md
согласованные документы активной задачи (гейты — в её task.yaml; см. tasks/AGENTS.md)
plan.md активной задачи
docs/architecture.md
docs/contract-pipeline.md — если меняется generation build
```

## Разрешено менять

```text
infra/**
Dockerfile*
compose*.yml
root build/generation scripts — совместно с зоной packages/contracts/, если меняются
                                contracts:*/generate:*
CI configuration — кроме .github/workflows/hexlet-check.yml
environment examples
состояние своего пункта в plan.md
infrastructure-раздел активного result.md
```

`.github/workflows/hexlet-check.yml` — внешний генерируемый чек учебной платформы. В его шапке стоит
`DO NOT DELETE OR EDIT THIS FILE`; редактирование, удаление и переименование репозитория ломают
проверку. Свой CI добавляется отдельным workflow-файлом, а не правкой этого.

## Обязан

- поднимать web, API и PostgreSQL через Docker Compose;
- использовать multi-stage builds там, где уместно;
- добавить healthchecks и dependency readiness;
- хранить config/secrets в environment, не в images;
- обеспечить воспроизводимый TypeSpec/codegen build;
- поддержать Android builder как build-time image;
- сохранять APK в документированный artifact path;
- учитывать, что Android Emulator работает на host;
- оставлять iOS build macOS/Xcode toolchain-у.

## Запрещено

- менять API или бизнес-правила ради удобства инфраструктуры;
- пытаться запускать iOS toolchain в Linux container;
- публиковать admin API без auth как production-safe сервис;
- встраивать secrets в repository или image;
- вводить Redis, worker или новый runtime-сервис без отдельной задачи и решения в ADR;
- редактировать, удалять или переименовывать `.github/workflows/hexlet-check.yml`;
- ставить `согласовано` самовольно: правило 11 корневого [`AGENTS.md`](../AGENTS.md), фиксация —
  только `task approve` после явного подтверждения владельца.

## При недостающем решении

Если runtime-топология, порядок запуска или способ доставки артефакта не зафиксированы
в согласованных документах активной задачи, не выбирай их молча: зафиксируй блокирующий пункт
в `plan.md` и верни соответствующий гейт в `черновик` — `task draft <id> <гейт>`, правила каскада —
в [`tasks/flows/full.md`](../tasks/flows/full.md).

## Definition of Done

- build воспроизводится из чистого checkout;
- `docker compose up --build` поднимает заявленные runtime services — применимо с задачи, которая
  вводит Compose; на текущем этапе `infra/` пуст и Docker не требуется;
- healthchecks проходят;
- migrations/startup order документированы;
- Android builder создаёт APK artifact;
- smoke test и применимые CI checks проходят;
- пункт плана и infrastructure-раздел `result.md` обновлены.
