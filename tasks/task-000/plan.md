---
status: черновик
---

# План TASK-000

## Декомпозиция

| ID | Цель / проблема | Решение | Состояние |
|---|---|---|---|
| P01 | Зафиксировать фактическое состояние host-инструментов | Задокументировать в `result.md` проверенные версии: Node 26.0.0, npm 11.12.1, Git 2.50.1, Android SDK + Java 17; Docker/Compose отсутствуют — по решению пользователя пока не устанавливаются | в плане |
| P02 | Нет корневого workspace-контура | Корневой `package.json` с `workspaces: ["apps/*", "packages/*"]`, `.nvmrc` = 26, `engines >=24`, полный `.gitignore`, `package-lock.json` | в плане |
| P03 | Нет локального TypeSpec/codegen toolchain | devDependencies: `typescript`, `@typespec/compiler`, `@typespec/http`, `@typespec/openapi3`, `@hey-api/openapi-ts`, `zod`; корневые scripts `contracts:format`, `contracts:format:check`, `contracts:build`, `generate`, `generate:check` | в плане |
| P04 | Нет согласованной структуры каталогов | Создать `apps/*`, `packages/*`, `infra` по `docs/architecture.md`; пустые точки расширения сохранить через `.gitkeep`; проверить ссылки документации | в плане |
| P05 | Генерационная цепочка не проверена | Smoke `.tsp` (health-операция, без домена) → OpenAPI 3.1 в `packages/contracts/generated` → SDK в `packages/api-client/src/generated` → types + Zod в `packages/backend-contract/src/generated` | в плане |
| P06 | Нет клиентского scaffold | `apps/client`: Expo + TypeScript + `react-native-web`, без продуктовых экранов; web-сборка через `expo export`; Android debug-сборка через `expo prebuild` + Gradle на host Android SDK | в плане |
| P07 | Нет API smoke-пакета | `apps/api`: минимальный сервер на `node:http` + TypeScript с health-endpoint по smoke-контракту; build/typecheck проходят | в плане |
| P08 | Docker-интерфейс не подготовлен | Подготовить Dockerfile для api/web и `compose.yml` (web, api, postgres, healthchecks). Валидация `docker compose config` и healthcheck заблокированы: Docker на хосте отсутствует, установка отложена решением пользователя | в плане |
| P09 | Нет защиты от generated drift | Проверить: повторный `npm run generate` не создаёт diff; `generate:check` падает при ручной правке generated; format-check проходит | в плане |
| P10 | Команды bootstrap не документированы | README с точными командами установки, генерации, проверок и запуска; финализация `result.md` | в плане |

## Порядок и зависимости

```text
P01
 └─ P02
     ├─ P03
     │   └─ P05
     │       ├─ P06
     │       └─ P07
     ├─ P04
     └─ P08 (только подготовка файлов; валидация заблокирована)

P05 + P06 + P07
 └─ P09 → P10
```

## Блокеры и открытые вопросы

- Docker и Compose отсутствуют на хосте; по решению пользователя провайдер пока не устанавливается. В P08 выполняется только подготовка файлов; валидация фиксируется как известное ограничение в `result.md`. Кандидат при разблокировке — colima + docker CLI + compose plugin (см. `adr.md`, решение 8).
- Вопросы прежней версии плана закрыты согласованным ADR: версия Node — 26 (`.nvmrc`, `engines >=24`); smoke-сервер — `node:http` без фреймворка; Android APK и образ android-builder — вне scope task-000, Android debug-сборка клиента выполняется в P06 на host toolchain.
