/**
 * Состояние гостевой ветки, живущее вне параметров route (brief FR7):
 * черновик формы — это PII, а на web параметры route уезжают в URL и историю браузера.
 *
 * Редьюсер — чистый: UUID ключа идемпотентности генерируется вызывающим кодом
 * и приходит в действии `booking/attempt`. Это делает правило «повтор уходит с тем же
 * ключом» проверяемым без обращения к криптографии платформы.
 */

export type GuestDraft = {
  name: string;
  email: string;
  note: string;
};

export type GuestFlowState = {
  draft: GuestDraft;
  /** `CreateBookingRequest.id` — живёт с первой попытки отправки до успешного ответа. */
  bookingKey: string | null;
};

export type GuestFlowAction =
  | { type: 'draft/change'; field: keyof GuestDraft; value: string }
  | { type: 'booking/attempt'; key: string }
  | { type: 'booking/succeeded' }
  | { type: 'flow/reset' };

export const emptyDraft: GuestDraft = { name: '', email: '', note: '' };

export const initialGuestFlowState: GuestFlowState = {
  draft: emptyDraft,
  bookingKey: null,
};

export function guestFlowReducer(state: GuestFlowState, action: GuestFlowAction): GuestFlowState {
  switch (action.type) {
    case 'draft/change':
      return { ...state, draft: { ...state.draft, [action.field]: action.value } };

    // Ключ выдаётся один раз: повтор после обрыва сети обязан уйти с тем же ключом,
    // иначе сервер не распознает его как повтор и создаст вторую бронь.
    case 'booking/attempt':
      return state.bookingKey === null ? { ...state, bookingKey: action.key } : state;

    case 'booking/succeeded':
      return { ...state, bookingKey: null };

    case 'flow/reset':
      return initialGuestFlowState;
  }
}
