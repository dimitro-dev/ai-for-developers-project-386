// Демо-наполнение публичной ссылки (FR10, ADR §5): на пустом хранилище посетитель
// встречает CALENDAR_NOT_CONFIGURED вместо календаря. Включается флагом SEED_DEMO,
// вызывается из server.ts сразу после создания хранилища.

import type { Store } from '../store/repositories.ts';
import { completeAdminSetup, createAdminEventType } from '../usecases/owner.ts';

/**
 * Наполнение идёт через use-cases, а не записью в store: доменные проверки
 * (существование зоны, делимость интервала, порядок границ) выполняются те же,
 * что и на HTTP-входе, и демо-данные не разъедутся с доменом при его изменении.
 *
 * Хранилище предполагается пустым. На уже настроенном календаре
 * `completeAdminSetup` штатно бросает `ONBOARDING_ALREADY_COMPLETED` — отказ не
 * подавляется: единственный вызов происходит на старте процесса, где состояние
 * заведомо чистое (in-memory), и сработавшая ошибка означала бы, что сид зовут
 * не оттуда. Идемпотентность понадобится вместе с постоянным хранилищем и
 * решается задачей `back/002`.
 */
export async function seedDemoCalendar(store: Store): Promise<void> {
  await completeAdminSetup(store, {
    displayName: 'Мария Иванова (демо)',
    timeZone: 'Europe/Moscow',
    availabilityRules: [
      {
        daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startLocal: '10:00',
        endLocal: '18:00',
      },
    ],
    slotIntervalMinutes: 30,
  });

  await createAdminEventType(store, {
    id: 'intro-30',
    name: 'Знакомство',
    description: 'Короткий разговор: обсудить задачу и понять, чем могу помочь.',
    durationMinutes: 30,
  });

  await createAdminEventType(store, {
    id: 'consultation-60',
    name: 'Консультация',
    description: 'Разбор вопроса целиком, с планом дальнейших шагов.',
    durationMinutes: 60,
  });
}
