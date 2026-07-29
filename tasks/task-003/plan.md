---
status: черновик
---

# План TASK-003

## Декомпозиция

| ID | Цель / проблема | Решение | Состояние |
|---|---|---|---|
| P01 | Нужен эталон проверки | Извлечь owner/guest steps и invariants из согласованных brief/domain docs | в плане |
| P02 | Не видно соответствие сценариев operations | Построить traceability matrix `scenario → operation → request → response/error` | в плане |
| P03 | Source и generated spec могут расходиться | Запустить TypeSpec compile/generate:check и проинспектировать OpenAPI routes/schemas | в плане |
| P04 | Generated packages могут быть непригодны | Выполнить frontend/backend generated package typecheck и smoke import | в плане |
| P05 | Нужно проверить negative cases | Сопоставить validation/not-found/conflict/window/alignment responses со сценариями | в плане |
| P06 | Возможен scope creep | Проверить отсутствие auth, ownerId/endAt inputs, произвольного окна и лишних endpoints | в плане |
| P07 | Контракт не доказывает domain behavior | Составить отдельный список обязательных будущих backend/domain tests | в плане |
| P08 | Нужен gate-результат | Заполнить result: pass/fail, gaps, команды и решение о готовности к реализации | в плане |

## Порядок и зависимости

```text
P01 → P02
P03 + P04
P02 + P03 + P04
 ├─ P05
 ├─ P06
 └─ P07

P05 + P06 + P07
 └─ P08
```

## Блокеры и открытые вопросы

- Требуется ли автоматический OpenAPI lint либо достаточно TypeSpec linter и сценарного review?
- Используется ли Prism/mock server в bootstrap pipeline?
- Какие checks должны стать постоянными CI gate после завершения задачи?
