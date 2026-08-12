import {
  guestFlowReducer,
  initialGuestFlowState,
  type GuestFlowState,
} from '@/features/guest/state/reducer';

const filledDraft: GuestFlowState = {
  draft: { name: 'Анна', email: 'anna@example.com', note: 'Обсудить контракт' },
  bookingKey: null,
};

describe('guestFlowReducer — черновик формы гостя', () => {
  it('обновляет поле черновика, не трогая остальные', () => {
    const next = guestFlowReducer(filledDraft, {
      type: 'draft/change',
      field: 'email',
      value: 'anna+new@example.com',
    });

    expect(next.draft).toEqual({
      name: 'Анна',
      email: 'anna+new@example.com',
      note: 'Обсудить контракт',
    });
  });

  // AC4: конфликт слота возвращает гостя на экран слотов; ни один шаг этого пути
  // черновик не очищает — он живёт в контейнере ветки, а не в параметрах route.
  it('черновик переживает возврат на экран слотов после конфликта слота', () => {
    const attempted = guestFlowReducer(filledDraft, { type: 'booking/attempt', key: 'key-1' });
    const backOnSlots = guestFlowReducer(attempted, {
      type: 'draft/change',
      field: 'note',
      value: 'Обсудить контракт',
    });
    const rechosenSlot = guestFlowReducer(backOnSlots, {
      type: 'draft/change',
      field: 'note',
      value: 'Обсудить контракт',
    });

    expect(rechosenSlot.draft).toEqual(filledDraft.draft);
    expect(rechosenSlot.bookingKey).toBe('key-1');
  });

  it('сбрасывает состояние ветки целиком по flow/reset', () => {
    const attempted = guestFlowReducer(filledDraft, { type: 'booking/attempt', key: 'key-1' });

    expect(guestFlowReducer(attempted, { type: 'flow/reset' })).toEqual(initialGuestFlowState);
  });
});

describe('guestFlowReducer — ключ идемпотентности', () => {
  it('выдаёт ключ при первой попытке отправки', () => {
    const next = guestFlowReducer(initialGuestFlowState, {
      type: 'booking/attempt',
      key: 'key-1',
    });

    expect(next.bookingKey).toBe('key-1');
  });

  // AC4: повтор после обрыва сети обязан уйти с тем же ключом, иначе сервер
  // не распознает его как повтор и создаст вторую бронь.
  it('удерживает первый ключ при повторных попытках', () => {
    const first = guestFlowReducer(initialGuestFlowState, {
      type: 'booking/attempt',
      key: 'key-1',
    });
    const retry = guestFlowReducer(first, { type: 'booking/attempt', key: 'key-2' });

    expect(retry.bookingKey).toBe('key-1');
    expect(retry).toBe(first);
  });

  it('освобождает ключ только после успеха', () => {
    const attempted = guestFlowReducer(initialGuestFlowState, {
      type: 'booking/attempt',
      key: 'key-1',
    });
    const succeeded = guestFlowReducer(attempted, { type: 'booking/succeeded' });

    expect(succeeded.bookingKey).toBeNull();

    const nextBooking = guestFlowReducer(succeeded, { type: 'booking/attempt', key: 'key-2' });
    expect(nextBooking.bookingKey).toBe('key-2');
  });
});
