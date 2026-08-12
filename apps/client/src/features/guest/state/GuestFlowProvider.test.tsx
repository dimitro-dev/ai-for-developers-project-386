import { act, renderHook } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { GuestFlowProvider, useGuestFlow } from '@/features/guest/state/GuestFlowProvider';

// Криптография платформы подменяется: проверяется обвязка контейнера, а не генератор UUID.
// Префикс `mock` обязателен — иначе jest не пускает переменную в фабрику `jest.mock`.
const mockNewBookingKey = jest.fn<string, []>();
jest.mock('@/features/guest/lib/newBookingKey', () => ({
  newBookingKey: () => mockNewBookingKey(),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <GuestFlowProvider>{children}</GuestFlowProvider>;
}

beforeEach(() => {
  mockNewBookingKey.mockReset();
  mockNewBookingKey.mockReturnValueOnce('uuid-1').mockReturnValueOnce('uuid-2');
});

describe('GuestFlowProvider', () => {
  it('хранит черновик формы вне параметров route', async () => {
    const { result } = await renderHook(() => useGuestFlow(), { wrapper });

    await act(() => result.current.setDraftField('name', 'Анна'));
    await act(() => result.current.setDraftField('email', 'anna@example.com'));

    expect(result.current.draft).toEqual({ name: 'Анна', email: 'anna@example.com', note: '' });
  });

  it('возвращает один и тот же ключ идемпотентности при повторной отправке', async () => {
    const { result } = await renderHook(() => useGuestFlow(), { wrapper });

    let firstAttempt = '';
    let retry = '';
    await act(() => {
      firstAttempt = result.current.beginBookingAttempt();
    });
    await act(() => {
      retry = result.current.beginBookingAttempt();
    });

    expect(firstAttempt).toBe('uuid-1');
    expect(retry).toBe('uuid-1');
    expect(mockNewBookingKey).toHaveBeenCalledTimes(1);
    expect(result.current.bookingKey).toBe('uuid-1');
  });

  it('после успеха следующая бронь получает новый ключ', async () => {
    const { result } = await renderHook(() => useGuestFlow(), { wrapper });

    await act(() => {
      result.current.beginBookingAttempt();
    });
    await act(() => result.current.completeBooking());

    expect(result.current.bookingKey).toBeNull();

    let nextKey = '';
    await act(() => {
      nextKey = result.current.beginBookingAttempt();
    });
    expect(nextKey).toBe('uuid-2');
  });

  it('useGuestFlow вне провайдера падает явной ошибкой', async () => {
    await expect(renderHook(() => useGuestFlow())).rejects.toThrow('вне GuestFlowProvider');
  });
});
