### Hexlet tests and linter status:
[![Actions Status](https://github.com/dimitro-dev/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/dimitro-dev/ai-for-developers-project-386/actions)

# MiniCal

Учебный сервис бронирования без регистрации и авторизации: владелец календаря настраивает расписание и типы событий, гость бронирует свободный слот. Подробности — в [`AGENTS.md`](AGENTS.md) и [`docs/architecture.md`](docs/architecture.md).

## Требования к машине

- Node.js 26 (файл [`.nvmrc`](.nvmrc); поддерживается `>=24`) и npm 11+
- GNU Make — 3.81 из поставки macOS достаточно
- Git
- Для нативной Android-сборки клиента: Android SDK и JDK 17 на хосте — [`apps/client/README.md`](apps/client/README.md)
- Docker — для локального контура PostgreSQL и для образа приложения; установка провайдера и проверка — [`infra/README.md`](infra/README.md). Проверки и запуск API и клиента из исходников от Docker не зависят.

## Установка

```bash
make setup
```

Одна цель восстанавливает все workspaces из `package-lock.json`, включая локальные TypeSpec compiler и codegen. Глобальная установка TypeSpec CLI не нужна.

## Команды

Строка команды определена ровно один раз — рецептом цели в `Makefile`, корневом или зональном.

```bash
make help                 # цели уровня репозитория с описаниями
make -C apps/client help  # цели зоны
```

`make` без аргументов делает то же, что `make help`. Полный набор проверок фазы «Проверка» — `make gates`; тот же набор выполняет CI. CLI процесса задач вызывается напрямую: `scripts/task status`, полный список команд — в [`tasks/AGENTS.md`](tasks/AGENTS.md).

Generated-каталоги (`packages/contracts/generated`, `packages/api-client/src/generated`, `packages/backend-contract/src/generated`) вручную не редактируются: их перезаписывает `make generate`.

## Запуск

| Что | Команда | Адрес | Подробности |
|---|---|---|---|
| Backend API | `make -C apps/api start` | `http://localhost:3001` | [`apps/api/README.md`](apps/api/README.md) |
| Мок контракта (Prism) | `make mock` | `http://localhost:4010` | [`infra/README.md`](infra/README.md) |
| Клиент в браузере | `make -C apps/client web` | `http://localhost:8081` | [`apps/client/README.md`](apps/client/README.md) |
| PostgreSQL | `make db-up` | `localhost:5432` | [`infra/README.md`](infra/README.md) |
| Приложение из образа | `make image-build`, затем `make image-run` | `http://localhost:3001` | [`infra/README.md`](infra/README.md) |

Backend поднимается без базы и без Docker: хранилище in-memory, состояние теряется при рестарте. Клиент по умолчанию ходит в мок контракта, а не в backend — адрес задаётся переменной окружения (см. README зоны клиента).

Образ приложения — отдельный способ запуска, для которого Docker нужен: в нём один процесс отдаёт с одного порта и API, и оба web-бандла клиента — гость на `/`, владелец на `/admin`. Порт и переменные окружения передаются параметрами цели; эксплуатация образа и порядок публикации — в [`infra/README.md`](infra/README.md).

## Структура

```text
apps/client               React Native / React Web клиент (Expo)
apps/api                  REST API: 12 операций контракта на Express 5, in-memory хранилище
packages/contracts        Ручной TypeSpec-контракт + generated OpenAPI
packages/api-client       Generated frontend SDK
packages/backend-contract Generated backend types + Zod schemas
packages/slot-engine      Slot Engine (появится в implementation task)
packages/database         PostgreSQL schema и миграции (появятся в implementation task)
infra                     Docker/Compose: compose.yml, .env.example, postgres/initdb/
make, scripts             слой команд: общая часть Makefile, вход к CLI задач, гейт документации
```

Полное дерево с назначением каждого каталога — в [`docs/architecture.md`](docs/architecture.md). Правила зоны лежат в её `AGENTS.md`, устройство — в `architecture.md`, эксплуатация — в `README.md`.

Рабочий процесс задач: [`tasks/AGENTS.md`](tasks/AGENTS.md) (маршрутизатор), правила треков — [`tasks/flows/`](tasks/flows/), реестр и очередь работ — [`tasks/REGISTRY.md`](tasks/REGISTRY.md).

## Локальные файлы

`.opencode/` (скиллы AI-процесса), `CLAUDE.md` и `.mcp.json` не публикуются в репозитории (см. [`.gitignore`](.gitignore)) — они содержат локальную конфигурацию харнессов. `tasks/` и `docs/` находятся в git, поэтому ссылки на них работают в любом клоне.
