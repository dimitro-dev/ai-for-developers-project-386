include ../../make/common.mk

typecheck: ## Проверить типы зоны
	tsc --noEmit

test: ## Запускать нечего: пакет generated, поведение проверяют потребители
	@:

gates: ## Проверки зоны: типы
	$(MAKE) typecheck

.PHONY: typecheck test gates
