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

# Строки подключения к локальному контуру: пользователь, пароль и порт — из compose.yml.
# Рабочая база и база тестов разные: прогон тестов чистит схему целиком.
DATABASE_URL ?= postgres://minical:minical@localhost:5432/minical
TEST_DATABASE_URL ?= postgres://minical:minical@localhost:5432/minical_test

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

# Значения в кавычках: в строке подключения легально встречается спецсимвол оболочки.
db-migrate: ## Применить миграции к базе (DATABASE_URL=postgres://minical:minical@localhost:5432/minical)
	$(RUN) DATABASE_URL='$(DATABASE_URL)' node $(REPO_ROOT)/packages/database/src/cli.ts

# Зоны перечислены обе: БД-наборы обеих читают одну переменную, и без неё молча скипаются —
# запускать их по отдельности значило бы забыть половину проверки.
db-test: ## Прогнать БД-тесты зон database и api против контура (TEST_DATABASE_URL=...minical_test)
	$(RUN) TEST_DATABASE_URL='$(TEST_DATABASE_URL)' $(MAKE) -C $(REPO_ROOT)/packages/database test
	$(RUN) TEST_DATABASE_URL='$(TEST_DATABASE_URL)' $(MAKE) -C $(REPO_ROOT)/apps/api test

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

.PHONY: typecheck test gates up down logs reset config db-migrate db-test image-build image-run
