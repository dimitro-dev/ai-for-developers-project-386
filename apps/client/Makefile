include ../../make/common.mk

typecheck: ## Проверить типы зоны
	tsc --noEmit

test: ## Тесты клиента рядом с кодом
	jest

gates: ## Проверки зоны: типы и тесты
	$(MAKE) typecheck
	$(MAKE) test

start: ## Запустить Expo dev server
	expo start

web: ## Запустить клиент в браузере
	expo start --web

android: ## Собрать и запустить нативный Android-клиент
	expo run:android

ios: ## Собрать и запустить нативный iOS-клиент (только macOS)
	expo run:ios

build: ## Экспортировать web-бандл
	expo export --platform web

.PHONY: typecheck test gates start web android ios build
