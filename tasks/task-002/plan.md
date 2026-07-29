---
status: черновик
---

# План TASK-002

## Декомпозиция

| ID | Цель / проблема | Решение | Состояние |
|---|---|---|---|
| P01 | Нужно проверить входные решения | Прочитать domain model/rules и составить trace списка операций и моделей | в плане |
| P02 | Нет общих transport primitives | Описать ids, local time, timezone fields, common response/error conventions | в плане |
| P03 | Нет моделей owner setup | Описать calendar settings, availability rules и setup state/request/response | в плане |
| P04 | Нет моделей Event Type | Описать create/list representations и ограничения полей | в плане |
| P05 | Нет моделей Slot/Booking/GuestDetails | Описать slot window, create booking input и booking output без клиентского `endAt` | в плане |
| P06 | Нет единой модели ошибок | Описать стабильные error codes и status-specific response variants | в плане |
| P07 | Не описаны admin operations | Добавить setup/settings, event-types и upcoming bookings operations | в плане |
| P08 | Не описаны public operations | Добавить public event-types, slots и create booking operations | в плане |
| P09 | Не хватает examples/docs | Добавить representative examples и документацию операций/полей | в плане |
| P10 | Контракт должен стать generated packages | Выполнить format/compile/generate, проверить OpenAPI и SDK/schema diff | в плане |
| P11 | Нужен отчёт для следующей QA-задачи | Зафиксировать route/model/error inventory и открытые gaps в result | в плане |

## Порядок и зависимости

```text
P01
 └─ P02
     ├─ P03
     ├─ P04
     ├─ P05
     └─ P06

P03 + P04 + P05 + P06
 ├─ P07
 └─ P08

P07 + P08
 └─ P09 → P10 → P11
```

## Блокеры и открытые вопросы

- Какой response shape используется для списков: массив напрямую или envelope?
- Нужен ли отдельный endpoint чтения Event Type по id, если гостевой flow может получить данные из списка/slots response?
- Какие ошибки объединяются в `SLOT_UNAVAILABLE`, а какие должны иметь отдельный код?
- Требуется ли pagination для upcoming bookings в учебном MVP?
