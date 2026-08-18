include ../make/common.mk

typecheck: ## Проверить типы CLI задач
	tsc --noEmit -p tools/tsconfig.json

test: ## Тесты CLI задач
	cd tools && node --experimental-strip-types --test

gates: ## Проверки зоны: типы и тесты CLI
	$(MAKE) typecheck
	$(MAKE) test

.PHONY: typecheck test gates
