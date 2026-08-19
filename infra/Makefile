include ../make/common.mk

COMPOSE := docker compose -f compose.yml

# Образ приложения. Порт совпадает с дефолтом config.ts: внутри контейнера и на хосте он один
# и тот же, иначе проброс пришлось бы задавать двумя переменными.
IMAGE ?= minical
PORT ?= 3001
# Порт входит в имя контейнера: с фиксированным именем два прогона на разных портах подрались бы
# за него, хотя мешать друг другу им нечем.
CONTAINER ?= $(IMAGE)-$(PORT)
# Единственная переменная окружения, дефолт которой цель обязана держать сама. Дефолт config.ts —
# `http://localhost:8081`, адрес dev-сервера Expo, — для запуска из образа неверен всегда:
# гостевую половину раздаёт тот же процесс, и живёт она на том же порту, что и API.
PUBLIC_WEB_URL ?= http://localhost:$(PORT)

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

# PORT и PUBLIC_WEB_URL передаются всегда — их дефолты держит цель (см. выше). SEED_DEMO
# передаётся только заданным: пустое значение и отсутствие переменной для конфига API — разные
# вещи, и дефолт по нему остаётся за ним. Значения в кавычках: в адресе легально встречается
# `&`, который иначе разорвал бы рецепт.
# Проверка образа отдельным шагом: без неё docker молча полез бы за `latest` в реестр.
image-run: ## Запустить образ (PORT=3001, PUBLIC_WEB_URL, SEED_DEMO; контейнер minical-<PORT>)
	@docker image inspect $(IMAGE) >/dev/null 2>&1 || \
	  { echo "образ «$(IMAGE)» не собран — выполните make image-build"; exit 1; }
	docker run --rm --name $(CONTAINER) -p $(PORT):$(PORT) -e PORT=$(PORT) \
	  -e PUBLIC_WEB_URL='$(PUBLIC_WEB_URL)' \
	  $(if $(SEED_DEMO),-e SEED_DEMO='$(SEED_DEMO)') \
	  $(IMAGE)

.PHONY: typecheck test gates up down logs reset config image-build image-run
