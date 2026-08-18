include ../../make/common.mk

# Дополнительные флаги Expo CLI для разовых запусков: make web EXPO_ARGS=--clear.
# Штатный механизм GNU Make (override variables) — вместо второго определения команды.
EXPO_ARGS ?=

typecheck: ## Проверить типы зоны
	tsc --noEmit

test: ## Тесты клиента рядом с кодом
	jest

gates: ## Проверки зоны: типы и тесты
	$(MAKE) typecheck
	$(MAKE) test

start: ## Запустить Expo dev server (EXPO_ARGS=--clear — сброс кеша Metro)
	expo start $(EXPO_ARGS)

web: ## Запустить клиент в браузере (EXPO_ARGS=--clear — сброс кеша Metro)
	expo start --web $(EXPO_ARGS)

android: ## Собрать и запустить нативный Android-клиент
	expo run:android $(EXPO_ARGS)

ios: ## Собрать и запустить нативный iOS-клиент (только macOS)
	expo run:ios $(EXPO_ARGS)

build: ## Экспортировать web-бандл
	expo export --platform web

.PHONY: typecheck test gates start web android ios build
