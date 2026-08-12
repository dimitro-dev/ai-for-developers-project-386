import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '@/design-system/components/AppButton';
import { AppHeader } from '@/design-system/components/AppHeader';
import { AppText } from '@/design-system/components/AppText';
import { AppTextField } from '@/design-system/components/AppTextField';
import { AppScrollView } from '@/design-system/layout/AppScrollView';
import { Column } from '@/design-system/layout/Column';
import { useColors } from '@/design-system/theme';
import { spacing, typography } from '@/design-system/tokens';
import { useGuestFlow } from '@/features/guest/state/GuestFlowProvider';
import type { GuestStackParamList } from '@/navigation/GuestStackParamList';

type Props = NativeStackScreenProps<GuestStackParamList, 'GuestBookingForm'>;

/**
 * Стаб-экран формы (`guest.booking-form`). Кроме параметров route показывает две вещи,
 * которые фундамент обязан гарантировать: черновик живёт в контейнере ветки (уходишь назад
 * на слоты — значения остаются) и ключ идемпотентности выдаётся один раз на бронь.
 */
export function GuestBookingFormStubScreen({ navigation, route }: Props) {
  const colors = useColors();
  const { eventTypeId, eventTypeName, startAtUtc, endAtUtc } = route.params;
  const { draft, bookingKey, setDraftField, beginBookingAttempt } = useGuestFlow();

  return (
    <Column flex={1} background={colors.background.primary}>
      <AppHeader title="Ваши данные" backAction={navigation.goBack} />
      <AppScrollView flex={1} contentPadding={spacing[24]} contentGap={spacing[12]}>
        <AppText typography={typography.title.small}>Стаб route `GuestBookingForm`</AppText>
        <AppText typography={typography.body.medium} testID="param-eventTypeName">
          {eventTypeName} ({eventTypeId})
        </AppText>
        <AppText typography={typography.body.medium} testID="param-slot">
          {startAtUtc} → {endAtUtc}
        </AppText>

        <AppTextField
          label="Имя"
          value={draft.name}
          onChangeText={(value) => setDraftField('name', value)}
          testID="draft-name"
        />
        <AppTextField
          label="Email"
          value={draft.email}
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(value) => setDraftField('email', value)}
          testID="draft-email"
        />

        <AppText
          typography={typography.body.small}
          color={colors.text.secondary}
          testID="booking-key"
        >
          Ключ идемпотентности: {bookingKey ?? '— (будет выдан при первой отправке)'}
        </AppText>

        <AppButton
          variant="secondary"
          width="fill"
          label="Выдать ключ идемпотентности"
          onPress={beginBookingAttempt}
        />
        <AppButton
          variant="primary"
          width="fill"
          label="К подтверждению"
          onPress={() =>
            navigation.navigate('GuestBookingConfirmation', {
              booking: {
                id: bookingKey ?? beginBookingAttempt(),
                eventTypeId,
                eventTypeName,
                startAtUtc,
                endAtUtc,
                guestName: draft.name,
                guestEmail: draft.email,
                ...(draft.note === '' ? {} : { guestNote: draft.note }),
                createdAtUtc: startAtUtc,
              },
            })
          }
        />
      </AppScrollView>
    </Column>
  );
}

export default GuestBookingFormStubScreen;
