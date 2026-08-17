import type { AvailabilityRule } from '@minical/api-client';

import { formatAvailabilitySummary, formatWeekdays } from '@/features/availability/lib';

function rule(
  daysOfWeek: AvailabilityRule['daysOfWeek'],
  startLocal: string,
  endLocal: string,
): AvailabilityRule {
  return { daysOfWeek, startLocal, endLocal };
}

describe('formatWeekdays', () => {
  it('сворачивает смежные дни в диапазон', () => {
    expect(formatWeekdays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])).toBe('Пн–Пт');
  });

  it('несмежные дни перечисляет через запятую', () => {
    expect(formatWeekdays(['Monday', 'Wednesday', 'Friday'])).toBe('Пн, Ср, Пт');
  });

  it('все дни недели сворачиваются в один диапазон', () => {
    expect(
      formatWeekdays([
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ]),
    ).toBe('Пн–Вс');
  });

  it('несколько смежных диапазонов разделяются запятой', () => {
    expect(formatWeekdays(['Monday', 'Tuesday', 'Thursday', 'Friday'])).toBe('Пн–Вт, Чт–Пт');
  });

  it('порядок и повторы во входе не влияют на результат', () => {
    expect(formatWeekdays(['Friday', 'Monday', 'Friday'])).toBe('Пн, Пт');
  });

  it('пустой список даёт пустую строку', () => {
    expect(formatWeekdays([])).toBe('');
  });
});

describe('formatAvailabilitySummary', () => {
  it('пустые правила — фолбэк-подпись, а не падение', () => {
    expect(formatAvailabilitySummary([])).toBe('Рабочее время не настроено');
  });

  it('одно правило — дни и время через точку (кадр 2 экрана 08)', () => {
    expect(
      formatAvailabilitySummary([
        rule(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '09:00', '18:00'),
      ]),
    ).toBe('Пн–Пт · 09:00–18:00');
  });

  it('все дни недели в одном правиле', () => {
    expect(
      formatAvailabilitySummary([
        rule(
          ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          '00:00',
          '23:45',
        ),
      ]),
    ).toBe('Пн–Вс · 00:00–23:45');
  });

  it('несколько правил с одинаковым интервалом перечисляются через «; »', () => {
    expect(
      formatAvailabilitySummary([
        rule(['Monday', 'Tuesday', 'Wednesday'], '09:00', '18:00'),
        rule(['Thursday', 'Friday'], '09:00', '18:00'),
      ]),
    ).toBe('Пн–Ср · 09:00–18:00; Чт–Пт · 09:00–18:00');
  });

  it('несколько правил с разными интервалами', () => {
    expect(
      formatAvailabilitySummary([
        rule(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], '09:00', '18:00'),
        rule(['Saturday'], '10:00', '14:00'),
      ]),
    ).toBe('Пн–Пт · 09:00–18:00; Сб · 10:00–14:00');
  });
});
