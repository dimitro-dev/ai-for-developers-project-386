include ../make/common.mk

COMPOSE := docker compose -f compose.yml

typecheck: ## Проверять нечего: зона не содержит TypeScript
	@:

test: ## Запускать нечего: контур проверяется job compose в CI
	@:

gates: ## Проверок зоны нет: валидация compose требует Docker и вынесена в CI
	@:

up: ## Поднять контур и дождаться healthy
	$(COMPOSE) up -d --wait

down: ## Остановить контур, сохранив данные
	$(COMPOSE) down

logs: ## Читать логи PostgreSQL
	$(COMPOSE) logs -f postgres

reset: ## Остановить контур и удалить volume с данными
	$(COMPOSE) down -v

config: ## Проверить конфигурацию compose без запуска
	$(COMPOSE) config -q

.PHONY: typecheck test gates up down logs reset config
