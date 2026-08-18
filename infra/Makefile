include ../make/common.mk

COMPOSE := docker compose -f compose.yml

# Образ приложения: имя и имя контейнера переопределяются из командной строки.
IMAGE ?= minical
CONTAINER ?= minical
# Порт совпадает с дефолтом config.ts: внутри контейнера и на хосте он один и тот же,
# иначе проброс пришлось бы задавать двумя переменными.
PORT ?= 3001

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

image-build: ## Собрать образ приложения (IMAGE=minical)
	docker build -t $(IMAGE) $(REPO_ROOT)

# SEED_DEMO и PUBLIC_WEB_URL пробрасываются только заданными: пустое значение — не то же
# самое, что отсутствие переменной, дефолты держит config.ts.
image-run: ## Запустить образ (PORT=3001, SEED_DEMO=, PUBLIC_WEB_URL=)
	docker run --rm --name $(CONTAINER) -p $(PORT):$(PORT) -e PORT=$(PORT) \
	  $(if $(SEED_DEMO),-e SEED_DEMO=$(SEED_DEMO)) \
	  $(if $(PUBLIC_WEB_URL),-e PUBLIC_WEB_URL=$(PUBLIC_WEB_URL)) \
	  $(IMAGE)

.PHONY: typecheck test gates up down logs reset config image-build image-run
