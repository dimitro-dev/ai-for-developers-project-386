# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Роль и границы

Зона Frontend Agent: реализовывать React Native/web интерфейс и клиентскую логику MiniCal.

### Читать

```text
корневой AGENTS.md
согласованные документы активной задачи (гейты — в её task.yaml; см. tasks/AGENTS.md)
plan.md активной задачи
связанные generated SDK/types
docs/domain-rules.md — для отображаемого поведения
docs/architecture.md — при изменении структуры клиента
docs/ui-spec-kit/README.md и MANUAL.md — перед любым экраном owner-flow или guest-flow
docs/ui-spec-kit/specs/ui/** — UISpec экрана, компоненты, токены, registry, api-bindings
.opencode/skills/uispec-generator/SKILL.md — обязательный скилл для создания UI
раздел «Expo HAS CHANGED» выше — версионированные docs Expo v57
```

### Разрешено менять

```text
apps/client/**
frontend tests
frontend mocks/fixtures
ручной wrapper-код packages/api-client/src/** вне generated/
docs/ui-spec-kit/specs/ui/** — только если правка UISpec предусмотрена согласованными
                               документами активной задачи
состояние своего пункта в plan.md
frontend-раздел активного result.md
```

## UI создаётся из UISpec

Экраны не проектируются «от себя». Owner-flow и guest-flow уже описаны декларативно в `docs/ui-spec-kit/specs/ui/`: `screens/` — по одному `*.screen.md` на экран, `components/`, `tokens/`, `navigation/`, `bindings/`, плюс визуальный reference в `ui-screen-mockups/`. UISpec — источник истины для внешнего вида, состояний и токенов; TypeSpec проекта остаётся источником истины для HTTP.

Для создания и изменения UI обязателен процесс скилла [`uispec-generator`](../../.opencode/skills/uispec-generator/SKILL.md). В OpenCode он вызывается как скилл; в Claude Code — доступен через `.claude/skills`, а при отсутствии симлинка `SKILL.md` читается как инструкция и выполняется по шагам вручную. Обязателен именно процесс, а не способ вызова. Порядок работы:

```text
1. Найти *.screen.md нужного экрана в docs/ui-spec-kit/specs/ui/screens/
   и связанные *.component.md, tokens, components.registry.xml, api-bindings.xml.
2. Прочитать MANUAL.md — формат файла, layout-правила, приоритеты при конфликте.
3. Провалидировать спеки ДО генерации:
   cd docs/ui-spec-kit && python3 tools/uispec/validate_uispec.py specs/ui
   Ожидаемый результат: валидатор завершается с `errors=0` (число файлов в наборе агент считает сам).
4. Сгенерировать каркас: сначала TypeScript models/state/actions,
   затем React Native view, затем fixtures и тесты.
   cd docs/ui-spec-kit && python3 tools/uispec/generate_scaffold.py \
     specs/ui/screens/<NN-name>.screen.md --out <каталог>
5. Дописать бизнес-логику, запросы через generated SDK, timezone-преобразования
   и анимации вручную по правилам MANUAL.md.
```

На этом хосте есть только `python3`; `python` отсутствует в PATH, поэтому команды из `docs/ui-spec-kit/README.md` и `SKILL.md` с `python` упадут с кодом 127. Скрипты кита существуют в одном экземпляре — канон лежит в `docs/ui-spec-kit/tools/uispec/`, а в скилл `uispec-generator` попадает симлинком `scripts/`; копий, которые могли бы разойтись, нет.

`generate_scaffold.py` создаёт каталог `--out` и пишет в него три файла: `{Name}.types.generated.ts`, `{Name}.generated.tsx`, `{Name}.models.generated.tsp`. Сгенерированный `.tsp` — фрагмент локальных UISpec-моделей; он **не** копируется в `packages/contracts/src/**`. Модели с `source="api"` и `operation`-ссылки действий привязываются к уже существующему контракту проекта, а не описываются заново.

Правила генерации:

- каждый UI-тег резолвится через `components.registry.xml`; произвольные примитивы вместо зарегистрированных компонентов не подставляются;
- генерация идёт в `*.generated.*`; рукописные wrapper-ы, use-cases, mappers и тесты не перезаписываются;
- состояния экрана — discriminated unions; API DTO и view model не отождествляются; view остаётся презентационным, данные приходят из container/use-case;
- явно объявленные спекой состояния (loading, empty, content, refreshing, error, validation) реализуются все;
- значения берутся из token references, а не хардкодятся; для icon-only контролов нужны accessibility labels, для Android — touch targets 48 dp;
- bottom-sheet presentation сохраняется там, где так указано в спеке;
- navigation-переходы берутся только из `navigation.uispec.xml`.

Приоритет при конфликте (`MANUAL.md`, §3):

```text
UX rules и acceptance criteria экрана
→ XML-блок UISpec
→ design tokens и component registry
→ визуальный reference PNG
→ предположение агента
```

Пиксели мокапа ниже текста спеки и токенов. При противоречии внутри спеки, отсутствующем токене/ассете или недостающей API-операции автоматическая генерация спорного участка останавливается, фиксируется contract gap и выносится в `plan.md` активной задачи — далее по разделу «При недостаточном контракте».

Изменение самих UISpec-файлов — изменение согласованной спецификации, а не деталь реализации: оно проходит через документы задачи (правило 8 корневого [`AGENTS.md`](../../AGENTS.md)), а не правкой в обход.

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
- дублировать Slot Engine на клиенте;
- реализовывать экраны, элементы и navigation-переходы, отсутствующие в UISpec;
- подменять зарегистрированные компоненты произвольными примитивами;
- хардкодить цвета, отступы и размеры вместо token references;
- менять внешний вид или набор состояний экрана в коде в обход UISpec;
- ставить `согласовано` самовольно: правило 11 корневого [`AGENTS.md`](../../AGENTS.md), фиксация — только `task approve` после явного подтверждения владельца.

## При недостаточном контракте

Зафиксировать блокирующий пункт и требуемое изменение в `plan.md` активной задачи, затем передать contract-работу в зону [`packages/contracts/`](../../packages/contracts/AGENTS.md). TypeSpec самостоятельно не менять.

## Definition of Done

- UI соответствует acceptance criteria;
- экран соответствует своему UISpec, component registry и токенам; расхождения зафиксированы как contract gap, а не «исправлены» молча;
- `validate_uispec.py` проходит на затронутых спеках;
- каждое UI-действие связано с операцией из `api-bindings.xml`;
- применимые состояния реализованы;
- generated SDK используется без обходов;
- `npm run typecheck`, `npm run uispec:validate` и `npm test -w @minical/client` проходят;
- изменения проверены минимум на web и Android, если задача затрагивает общий UI;
- пункт плана и frontend-раздел `result.md` обновлены.
