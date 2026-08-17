import { AppText } from '@/design-system/components/AppText';
import { Center } from '@/design-system/layout/Center';
import { AppSafeArea } from '@/design-system/layout/AppSafeArea';
import { useColors } from '@/design-system/theme';
import { spacing, typography } from '@/design-system/tokens';

/**
 * Временная заглушка owner-корня для `EXPO_PUBLIC_APP_MODE=owner` (`front/owner/001` P02).
 * Настоящая owner-навигация (`SetupCheck → OnboardingStack → OwnerTabs`, ADR §2) появится
 * пунктом P14 и полностью заменит этот компонент.
 */
export function OwnerRootPlaceholder() {
  const colors = useColors();

  return (
    <AppSafeArea background={colors.background.primary} testID="owner-root-placeholder">
      <Center flex={1} padding={spacing[24]}>
        <AppText typography={typography.title.medium} align="center">
          Owner-флоу в разработке
        </AppText>
      </Center>
    </AppSafeArea>
  );
}

export default OwnerRootPlaceholder;
