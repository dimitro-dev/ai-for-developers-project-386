import { createContext, useCallback, useContext, useMemo, useReducer, type ReactNode } from 'react';

import { newBookingKey } from '@/features/guest/lib/newBookingKey';

import {
  guestFlowReducer,
  initialGuestFlowState,
  type GuestDraft,
  type GuestFlowState,
} from './reducer';

export type GuestFlowContextValue = GuestFlowState & {
  setDraftField: (field: keyof GuestDraft, value: string) => void;
  /** Возвращает ключ идемпотентности текущей брони, выдавая новый только при первой попытке. */
  beginBookingAttempt: () => string;
  completeBooking: () => void;
  resetFlow: () => void;
};

const GuestFlowContext = createContext<GuestFlowContextValue | null>(null);

export function GuestFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(guestFlowReducer, initialGuestFlowState);

  const setDraftField = useCallback((field: keyof GuestDraft, value: string) => {
    dispatch({ type: 'draft/change', field, value });
  }, []);

  const beginBookingAttempt = useCallback(() => {
    const key = state.bookingKey ?? newBookingKey();
    dispatch({ type: 'booking/attempt', key });
    return key;
  }, [state.bookingKey]);

  const completeBooking = useCallback(() => {
    dispatch({ type: 'booking/succeeded' });
  }, []);

  const resetFlow = useCallback(() => {
    dispatch({ type: 'flow/reset' });
  }, []);

  const value = useMemo<GuestFlowContextValue>(
    () => ({ ...state, setDraftField, beginBookingAttempt, completeBooking, resetFlow }),
    [state, setDraftField, beginBookingAttempt, completeBooking, resetFlow],
  );

  return <GuestFlowContext.Provider value={value}>{children}</GuestFlowContext.Provider>;
}

export function useGuestFlow(): GuestFlowContextValue {
  const value = useContext(GuestFlowContext);
  if (value === null) {
    throw new Error('useGuestFlow вызван вне GuestFlowProvider');
  }
  return value;
}
