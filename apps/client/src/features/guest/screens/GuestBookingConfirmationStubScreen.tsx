import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '@/design-system/components/AppButton';
import { AppText } from '@/design-system/components/AppText';
import { AppScrollView } from '@/design-system/layout/AppScrollView';
import { useColors } from '@/design-system/theme';
import { spacing, typography } from '@/design-system/tokens';
import { useGuestFlow } from '@/features/guest/state/GuestFlowProvider';
import type { GuestStackParamList } from '@/navigation/GuestStackParamList';

type Props = NativeStackScreenProps<GuestStackParamList, 'GuestBookingConfirmation'>;

/**
 * Стаб-экран подтверждения (`guest.booking-confirmation`). Единственный route с объектным
 * параметром — `booking: Booking`: именно из-за него навигация не привязана к URL (ADR §1).
 */
export function GuestBookingConfirmationStubScreen({ navigation, route }: Props) {
  const colors = useColors();
  const { booking } = route.params;
  const { resetFlow } = useGuestFlow();

  return (
    <AppScrollView
      flex={1}
      background={colors.background.primary}
      contentPadding={spacing[24]}
      contentGap={spacing[8]}
    >
      <AppText typography={typography.title.large}>Встреча подтверждена</AppText>
      <AppText typography={typography.body.small} color={colors.text.secondary}>
        Стаб route `GuestBookingConfirmation` — параметр `booking`
      </AppText>
      <AppText typography={typography.body.medium} testID="booking-id">
        id: {booking.id}
      </AppText>
      <AppText typography={typography.body.medium}>
        {booking.eventTypeName} ({booking.eventTypeId})
      </AppText>
      <AppText typography={typography.body.medium}>
        {booking.startAtUtc} → {booking.endAtUtc}
      </AppText>
      <AppText typography={typography.body.medium} testID="booking-guest">
        {booking.guestName} · {booking.guestEmail}
      </AppText>
      <AppText typography={typography.body.medium} color={colors.text.secondary}>
        note: {booking.guestNote ?? '—'}
      </AppText>
      <AppButton
        variant="secondary"
        width="fill"
        label="В начало"
        onPress={() => {
          resetFlow();
          navigation.reset({ index: 0, routes: [{ name: 'GuestEventTypes' }] });
        }}
      />
    </AppScrollView>
  );
}

export default GuestBookingConfirmationStubScreen;
