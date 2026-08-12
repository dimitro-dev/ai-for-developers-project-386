import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '@/design-system/components/AppButton';
import { AppHeader } from '@/design-system/components/AppHeader';
import { AppText } from '@/design-system/components/AppText';
import { AppScrollView } from '@/design-system/layout/AppScrollView';
import { Column } from '@/design-system/layout/Column';
import { useColors } from '@/design-system/theme';
import { spacing, typography } from '@/design-system/tokens';
import type { GuestStackParamList } from '@/navigation/GuestStackParamList';

type Props = NativeStackScreenProps<GuestStackParamList, 'GuestSlots'>;

/** Слот-заглушка вместо ответа `getPublicSlots`: реальную сетку рисует `front-guest-002`. */
const STUB_SLOT = {
  startAtUtc: '2026-08-14T08:00:00Z',
  endAtUtc: '2026-08-14T08:30:00Z',
} as const;

/** Стаб-экран выбора времени (`guest.slots`): показывает свои четыре параметра route. */
export function GuestSlotsStubScreen({ navigation, route }: Props) {
  const colors = useColors();
  const { eventTypeId, eventTypeName, durationMinutes, eventTypeDescription } = route.params;

  return (
    <Column flex={1} background={colors.background.primary}>
      <AppHeader title={eventTypeName} backAction={navigation.goBack} />
      <AppScrollView flex={1} contentPadding={spacing[24]} contentGap={spacing[8]}>
        <AppText typography={typography.title.small}>Стаб route `GuestSlots`</AppText>
        <AppText typography={typography.body.medium} testID="param-eventTypeId">
          eventTypeId: {eventTypeId}
        </AppText>
        <AppText typography={typography.body.medium} testID="param-eventTypeName">
          eventTypeName: {eventTypeName}
        </AppText>
        <AppText typography={typography.body.medium} testID="param-durationMinutes">
          durationMinutes: {durationMinutes}
        </AppText>
        <AppText
          typography={typography.body.medium}
          color={colors.text.secondary}
          testID="param-eventTypeDescription"
        >
          eventTypeDescription: {eventTypeDescription ?? '—'}
        </AppText>
        <AppButton
          variant="primary"
          width="fill"
          label="Продолжить"
          onPress={() =>
            navigation.navigate('GuestBookingForm', {
              eventTypeId,
              eventTypeName,
              startAtUtc: STUB_SLOT.startAtUtc,
              endAtUtc: STUB_SLOT.endAtUtc,
            })
          }
        />
      </AppScrollView>
    </Column>
  );
}

export default GuestSlotsStubScreen;
