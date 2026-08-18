# @minical/client — запуск и окружение

Эксплуатация зоны клиента: режимы запуска единой сборки, переменные окружения, debug-сборка Android.
Правила зоны — [`AGENTS.md`](AGENTS.md); список целей с описаниями печатает `make help` в этом каталоге.

## Режимы запуска

Цели вызываются из `apps/client/` (`make web`) либо из корня репозитория
(`make -C apps/client web`). Зависимости ставятся один раз в корне: `make setup`.

| Цель | Что делает |
|---|---|
| `make start` | dev-сервер Expo (Metro) на порту `8081`; платформа выбирается в его интерфейсе |
| `make web` | dev-сервер и клиент в браузере |
| `make android` | нативный Android-клиент на подключённом устройстве или эмуляторе |
| `make ios` | нативный iOS-клиент; только macOS с установленным Xcode-toolchain |
| `make build` | production-экспорт web-бандла в `apps/client/dist` |

Дополнительные флаги Expo CLI передаются переменной `EXPO_ARGS` — её принимают `start`, `web`,
`android` и `ios`: `make web EXPO_ARGS=--clear` сбрасывает кеш Metro.

Проверки зоны — `make typecheck`, `make test` и `make gates`.

Backend клиент себе не поднимает: адрес API задаёт переменная окружения (ниже), по умолчанию это
mock-сервер контракта — `make mock` в корне репозитория. Реальный backend живёт в зоне `apps/api/`.

## Переменные окружения

Единая сборка клиента содержит оба флоу; какой из них монтируется и куда он ходит за данными, задают
две переменные окружения. Обе читаются статически (`process.env.EXPO_PUBLIC_APP_MODE`), поэтому Expo
инлайнит их в бандл на старте — **после смены значения dev-сервер нужно перезапустить с `--clear`**,
иначе применится закешированное. Флаг передаётся целям запуска переменной `EXPO_ARGS`:
`make web EXPO_ARGS=--clear`.

- **`EXPO_PUBLIC_APP_MODE`** — `guest` (по умолчанию) или `owner`. Любое другое значение, пустая
  строка и отсутствие переменной дают гостевой флоу; owner-корень
  (`SetupCheck → Onboarding → OwnerTabs`) монтируется только при точном `owner`.
- **`EXPO_PUBLIC_API_BASE_URL`** — адрес API. По умолчанию — mock-сервер:
  `http://localhost:4010`, на Android-эмуляторе `http://10.0.2.2:4010` (внутри эмулятора
  `localhost` — он сам). Для работы против реального backend нужен явный адрес.

Переменные передаются префиксом перед целью:

```bash
# owner-флоу в браузере против реального backend, со сбросом кеша Metro
EXPO_PUBLIC_APP_MODE=owner EXPO_PUBLIC_API_BASE_URL=http://localhost:3001 make web EXPO_ARGS=--clear

# owner-флоу на Android-эмуляторе
EXPO_PUBLIC_APP_MODE=owner EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3001 make android EXPO_ARGS=--clear

# гостевой флоу — как раньше, переменные не нужны
make web
```

Auth в MVP нет: owner-режим — способ локально открыть экраны владельца, а не защищённая роль
(правило 9 корневого [`AGENTS.md`](../../AGENTS.md)). Оба режима ходят в один backend, состояние
onboarding общее.

## Debug-сборка Android

`make android` разворачивает нативный проект в `apps/client/android/` (Expo prebuild при первом
запуске), собирает debug-вариант и ставит его на подключённое устройство или эмулятор. Нужны Android
SDK и JDK 17 на хосте; каталог SDK задаётся переменной `ANDROID_HOME` (на macOS обычно
`$HOME/Library/Android/sdk`). Артефакт остаётся по пути:

```text
apps/client/android/app/build/outputs/apk/debug/app-debug.apk
```

Собрать APK без устройства можно Gradle-задачей `assembleDebug` в уже развёрнутом
`apps/client/android/`:

```bash
cd apps/client/android && ANDROID_HOME="$HOME/Library/Android/sdk" ./gradlew assembleDebug
```

Каталоги `apps/client/android/` и `apps/client/ios/` не хранятся в git (continuous native
generation): их пересоздаёт prebuild. Воспроизводимая сборка APK в контейнере — отдельная задача
`infra/002`, собственной цели `make` для неё пока нет.
