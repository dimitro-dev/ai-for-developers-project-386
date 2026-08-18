include ../../make/common.mk

TSP_SOURCES := "src/**/*.tsp"

typecheck: ## Проверять нечего: зона не содержит TypeScript
	@:

test: ## Запускать нечего: контракт проверяет корневой контрактный гейт
	@:

gates: ## Проверки зоны: форматирование TypeSpec
	$(MAKE) format-check

format: ## Отформатировать исходники TypeSpec
	tsp format $(TSP_SOURCES)

format-check: ## Проверить форматирование TypeSpec
	tsp format --check $(TSP_SOURCES)

build: ## Скомпилировать TypeSpec в generated/openapi.yaml
	tsp compile src/main.tsp --config tspconfig.yaml

.PHONY: typecheck test gates format format-check build
