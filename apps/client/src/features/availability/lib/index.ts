/**
 * Helpers `@/features/availability/lib` из `components.registry.xml`.
 *
 * Модуль владеет всей группой хелперов графика (`formatWeekdays`, `formatDaysOff`,
 * `formatAvailabilitySummary`, `toAvailabilityRules`, `overwriteMessage`, `applyDaysLabel`) —
 * `front/owner/001 P05` реализует только `formatWeekdays` (внутренняя зависимость сводки) и
 * `formatAvailabilitySummary`. Остальные хелперы обслуживают bottom sheet рабочих часов
 * (экраны 03/04/07, пункты плана P16/P19) и добавляются вместе с их реализацией.
 */

import type { AvailabilityRule, DayOfWeek } from '@minical/api-client';

const WEEKDAY_ORDER: readonly DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const WEEKDAY_SHORT_LABEL: Record<DayOfWeek, string> = {
  Monday: 'Пн',
  Tuesday: 'Вт',
  Wednesday: 'Ср',
  Thursday: 'Чт',
  Friday: 'Пт',
  Saturday: 'Сб',
  Sunday: 'Вс',
};

const EMPTY_SCHEDULE_SUMMARY = 'Рабочее время не настроено';

/**
 * Компактная подпись дней недели: смежные по календарному порядку (с понедельника) дни
 * сворачиваются в диапазон («Пн–Пт»), несмежные перечисляются через запятую («Пн, Ср, Пт»).
 * Порядок и повторы во входном массиве не влияют на результат.
 */
export function formatWeekdays(daysOfWeek: readonly DayOfWeek[]): string {
  const indices = [...new Set(daysOfWeek.map((day) => WEEKDAY_ORDER.indexOf(day)))].sort(
    (left, right) => left - right,
  );
  if (indices.length === 0) {
    return '';
  }

  const ranges: number[][] = [];
  let current: number[] = [indices[0]];
  for (const index of indices.slice(1)) {
    if (index === current[current.length - 1] + 1) {
      current.push(index);
    } else {
      ranges.push(current);
      current = [index];
    }
  }
  ranges.push(current);

  return ranges
    .map((range) => {
      const start = WEEKDAY_SHORT_LABEL[WEEKDAY_ORDER[range[0]]];
      const end = WEEKDAY_SHORT_LABEL[WEEKDAY_ORDER[range[range.length - 1]]];
      return range.length === 1 ? start : `${start}–${end}`;
    })
    .join(', ');
}

/**
 * Краткая сводка рабочего графика для settings row экрана 08 («Пн–Пт · 09:00–18:00»).
 * Несколько правил с разными интервалами перечисляются через «; ». Пустой список правил — состояние,
 * недостижимое после завершённого онбординга (экран 03 требует хотя бы один интервал), но
 * обрабатывается явно, а не падением.
 */
export function formatAvailabilitySummary(rules: readonly AvailabilityRule[]): string {
  if (rules.length === 0) {
    return EMPTY_SCHEDULE_SUMMARY;
  }

  return rules
    .map((rule) => `${formatWeekdays(rule.daysOfWeek)} · ${rule.startLocal}–${rule.endLocal}`)
    .join('; ');
}
