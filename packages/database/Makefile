include ../../make/common.mk

typecheck: ## Проверить типы зоны
	$(RUN) tsc --noEmit

test: ## Запускать нечего: интеграционные тесты схемы и раннера появляются в P02
	@:

gates: ## Проверки зоны: типы и тесты
	$(MAKE) typecheck
	$(MAKE) test

.PHONY: typecheck test gates
