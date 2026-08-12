import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';

import { errorMessage } from '@/api/errors';
import { AppButton } from '@/design-system/components/AppButton';
import { AppText } from '@/design-system/components/AppText';
import { AppScrollView } from '@/design-system/layout/AppScrollView';
import { Column } from '@/design-system/layout/Column';
import { Spacer } from '@/design-system/layout/Spacer';
import { useColors } from '@/design-system/theme';
import { spacing, typography } from '@/design-system/tokens';
import type { CalendarView, EventTypeView } from '@/features/guest/model/types';
import { loadPublicCalendar, loadPublicEventTypes } from '@/features/guest/usecases/guest';
import type { GuestStackParamList } from '@/navigation/GuestStackParamList';
import { StateView } from '@/shared/ui-state/StateView';

type Props = NativeStackScreenProps<GuestStackParamList, 'GuestEventTypes'>;

type ProbeState = 'loading' | 'content' | 'error';

/**
 * Стаб-экран каталога (`guest.event-types`). Экран целиком реализует `front-guest-002`;
 * здесь фундамент доказывает, что он работает: пара чтений уходит через generated SDK
 * на base URL из `EXPO_PUBLIC_API_BASE_URL` (AC2), а результат — реальный, а не подставленный.
 */
export function GuestEventTypesStubScreen({ navigation }: Props) {
  const colors = useColors();
  const [state, setState] = useState<ProbeState>('loading');
  const [calendar, setCalendar] = useState<CalendarView | null>(null);
  const [eventTypes, setEventTypes] = useState<readonly EventTypeView[]>([]);
  const [failure, setFailure] = useState<string>('');

  const runProbe = useCallback(() => {
    let cancelled = false;
    setState('loading');

    void Promise.all([loadPublicCalendar(), loadPublicEventTypes()]).then(([cal, types]) => {
      if (cancelled) {
        return;
      }
      if (!types.ok) {
        setFailure(errorMessage(types.error));
        setState('error');
        return;
      }
      setCalendar(cal.ok ? cal.data : null);
      setEventTypes(types.data);
      setState('content');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(runProbe, [runProbe]);

  return (
    <AppScrollView
      flex={1}
      background={colors.background.primary}
      contentPadding={spacing[24]}
      contentGap={spacing[12]}
    >
      <AppText typography={typography.title.large}>Каталог встреч</AppText>
      <AppText typography={typography.body.small} color={colors.text.secondary}>
        Стаб route `GuestEventTypes` — параметров нет
      </AppText>
      <Spacer size={spacing[16]} />

      <StateView state="loading" current={state}>
        <AppText typography={typography.body.medium}>Запрос к API…</AppText>
      </StateView>

      <StateView state="error" current={state}>
        <Column gap={spacing[12]}>
          <AppText typography={typography.body.medium} color={colors.status.error} testID="probe-error">
            {failure}
          </AppText>
          <AppButton variant="secondary" label="Повторить" onPress={runProbe} />
        </Column>
      </StateView>

      <StateView state="content" current={state}>
        <Column gap={spacing[12]}>
          <AppText typography={typography.title.small} testID="probe-calendar">
            {calendar === null ? 'Календарь недоступен' : calendar.displayName}
          </AppText>
          <AppText typography={typography.body.small} color={colors.text.secondary}>
            Типов встреч получено: {eventTypes.length}
          </AppText>
          {eventTypes.map((eventType) => (
            <AppButton
              key={eventType.id}
              variant="primary"
              width="fill"
              label={`${eventType.name} · ${eventType.durationMinutes} мин`}
              onPress={() =>
                navigation.navigate('GuestSlots', {
                  eventTypeId: eventType.id,
                  eventTypeName: eventType.name,
                  durationMinutes: eventType.durationMinutes,
                  ...(eventType.description === null
                    ? {}
                    : { eventTypeDescription: eventType.description }),
                })
              }
            />
          ))}
        </Column>
      </StateView>
    </AppScrollView>
  );
}

export default GuestEventTypesStubScreen;
