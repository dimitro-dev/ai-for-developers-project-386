import { AppText } from '@/design-system/components/AppText';
import { AppSafeArea } from '@/design-system/layout/AppSafeArea';
import { Center } from '@/design-system/layout/Center';
import { useColors } from '@/design-system/theme';
import { spacing, typography } from '@/design-system/tokens';

/**
 * Временные экранные заглушки owner-навигации (`front/owner/001` P14). Каждый компонент здесь
 * закрывает ровно один route `navigation.uispec.xml`, чтобы `OwnerRoot`/`OnboardingStack`/
 * `OwnerMeetingsStack`/`OwnerSettingsStack` собирались и тестировались уже сейчас — реальные
 * контейнеры экранов (редьюсер + view + usecases) появятся пунктами плана P15–P19 и заменят
 * соответствующий экспорт здесь один за другим; когда все девять заменены, этот файл удаляется.
 *
 * `EventTypesScreen` обслуживает оба одноимённых по экрану route спеки — `EventTypes`
 * (вкладка «Встречи») и `EventTypesFromSettings` (вкладка «Настройки», `owner.event-types`
 * повторно зарегистрирован под вторым route ради собственного back-стека вкладки).
 */
function createOwnerStubScreen(label: string, testID: string) {
  function OwnerStubScreen() {
    const colors = useColors();
    return (
      <AppSafeArea background={colors.background.primary} testID={testID}>
        <Center flex={1} padding={spacing[24]}>
          <AppText typography={typography.title.medium} align="center">
            {label}
          </AppText>
        </Center>
      </AppSafeArea>
    );
  }
  OwnerStubScreen.displayName = `OwnerStubScreen(${testID})`;
  return OwnerStubScreen;
}

/** route `SetupCheck` — заменяется в P15. */
export const SetupCheckScreen = createOwnerStubScreen('SetupCheck — заменяется в P15', 'owner-stub-setup-check');

/** route `OnboardingProfile` — заменяется в P16. */
export const OnboardingProfileScreen = createOwnerStubScreen(
  'OnboardingProfile — заменяется в P16',
  'owner-stub-onboarding-profile',
);

/** route `OnboardingWorkingHours` — заменяется в P16. */
export const OnboardingWorkingHoursScreen = createOwnerStubScreen(
  'OnboardingWorkingHours — заменяется в P16',
  'owner-stub-onboarding-working-hours',
);

/** route `OwnerMeetings` — заменяется в P17. */
export const OwnerMeetingsScreen = createOwnerStubScreen(
  'OwnerMeetings — заменяется в P17',
  'owner-stub-owner-meetings',
);

/** route `EventTypes` и `EventTypesFromSettings` — заменяется в P18. */
export const EventTypesScreen = createOwnerStubScreen('EventTypes — заменяется в P18', 'owner-stub-event-types');

/** route `CreateEventType` — заменяется в P18. */
export const CreateEventTypeScreen = createOwnerStubScreen(
  'CreateEventType — заменяется в P18',
  'owner-stub-create-event-type',
);

/** route `OwnerSettings` — заменяется в P19. */
export const OwnerSettingsScreen = createOwnerStubScreen(
  'OwnerSettings — заменяется в P19',
  'owner-stub-owner-settings',
);

/** route `OwnerProfileSettings` — заменяется в P19. */
export const OwnerProfileSettingsScreen = createOwnerStubScreen(
  'OwnerProfileSettings — заменяется в P19',
  'owner-stub-owner-profile-settings',
);

/** route `OwnerWorkingHoursSettings` — заменяется в P19. */
export const OwnerWorkingHoursSettingsScreen = createOwnerStubScreen(
  'OwnerWorkingHoursSettings — заменяется в P19',
  'owner-stub-owner-working-hours-settings',
);
