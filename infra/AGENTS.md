# infra — build, runtime и CI

Зона Infrastructure Agent: обеспечить воспроизводимый build, локальный runtime, Android artifact и
CI-интерфейс проекта.

`infra/001` ввёл первый сервис контура:

```text
infra/
├── compose.yml
├── .env.example
└── postgres/initdb/01-test-database.sh
```

Провайдер — colima + docker CLI + Compose plugin (Homebrew); образ — `postgres:18`, единственный
официальный образ, сборок в контуре нет. Имя проекта Compose — `minical`; project directory —
`infra/`, поэтому любой ручной вызов идёт с `-f infra/compose.yml`, штатный путь — npm-скрипты
`db:up`, `db:down`, `db:logs`, `db:reset`. Две базы — `minical` (разработка) и `minical_test`
(`back/002`); init-скрипты в `/docker-entrypoint-initdb.d/` отрабатывают только на пустом каталоге
данных volume, поэтому изменение набора баз требует `npm run db:reset`. Установка провайдера и
полный список команд для пользователя контура — в README.

Сервисы `api`/`web` и Android builder (`infra/002`) — отдельные задачи; подробнее — в «Точка
расширения» ниже. Код без задачи, которая это предусматривает, здесь не появляется.

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

Ниже — целевое состояние зоны целиком; закрывается по частям, отдельными задачами (статус — в
Definition of Done).

- поднимать web, API и PostgreSQL через Docker Compose (PostgreSQL — `infra/001`; `api` и `web` —
  задача вместе с `back/002`);
- использовать multi-stage builds там, где уместно;
- добавить healthchecks и dependency readiness (для `postgres` — сделано);
- хранить config/secrets в environment, не в images;
- обеспечить воспроизводимый TypeSpec/codegen build;
- поддержать Android builder как build-time image (`infra/002`);
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

## Точка расширения

Контур сейчас — один сервис `postgres`. Дальнейшее расширение не входит в `infra/001` и делается
отдельными задачами:

- **`api` и `web`** добавляются задачей вместе с `back/002`: сервисы подключаются к `postgres` по
  параметрам, которые контур уже предоставляет (переменные `POSTGRES_*`, порт, имя базы). Форму
  строки подключения (`DATABASE_URL` целиком или набор переменных) выбирает `back/002` — этот
  контур её не предопределяет.
- **Применение миграций** — шаг той же задачи `back/002`; где именно он встаёт (при старте `api`,
  отдельным шагом CI, вручную) — решается там, не здесь.
- **E2E-прогон web на Playwright (`infra/008`)** поднимает этот же контур (`docker compose -f
  infra/compose.yml up -d --wait`) как предусловие перед тестами; сам контур под эту задачу не
  меняется.

Инструкции для пользователя контура (установка провайдера, запуск, переменные) — в README,
разделы «Требования к окружению» и «Запуск»; здесь — только то, что нужно тому, кто меняет зону.

## Definition of Done

Целевое состояние зоны целиком, закрывается по частям — ниже отмечено, что уже сделано и чем.

- build воспроизводится из чистого checkout — сборок образов в контуре пока нет: единственный
  сервис использует официальный образ `postgres:18`;
- `docker compose -f infra/compose.yml up -d --wait` поднимает контур до healthy — для `postgres`
  сделано в `infra/001`; сервисы `api`/`web` (и вместе с ними флаг `--build` для их образов) —
  задача вместе с `back/002`;
- healthchecks проходят — для `postgres` сделано;
- migrations/startup order документированы — появляются вместе с `back/002`, эта задача их не
  вводит;
- Android builder создаёт APK artifact — `infra/002`;
- smoke test и применимые CI checks проходят — для `postgres` сделано (job `compose` в `ci.yml`);
- пункт плана и infrastructure-раздел `result.md` обновлены.
