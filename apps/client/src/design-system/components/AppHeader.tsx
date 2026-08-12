import { Pressable, StyleSheet } from 'react-native';

import { AppIcon } from '@/design-system/components/AppIcon';
import { AppText } from '@/design-system/components/AppText';
import { Row } from '@/design-system/layout/Row';
import { useColors } from '@/design-system/theme';
import { sizes, spacing, typography } from '@/design-system/tokens';

export interface AppHeaderProps {
  title: string;
  /** Кнопка «Назад» появляется, только если действие передано. */
  backAction?: () => void;
  testID?: string;
}

/**
 * UISpec-тег `Header`. `rightActions` спеки не реализованы: гостевые экраны их не используют,
 * а `AppIconButton` в этой задаче не создаётся.
 */
export function AppHeader({ title, backAction, testID }: AppHeaderProps) {
  const colors = useColors();
  return (
    <Row
      testID={testID}
      height={sizes.header.height}
      paddingHorizontal={spacing[16]}
      gap={spacing[8]}
      align="center"
      background={colors.background.primary}
    >
      {backAction === undefined ? null : (
        <Pressable
          testID="app-header-back"
          onPress={backAction}
          accessibilityRole="button"
          accessibilityLabel="Назад"
          style={styles.backTarget}
        >
          <AppIcon name="arrow-left" size={sizes.icon.medium} color={colors.icon.primary} />
        </Pressable>
      )}
      <AppText typography={typography.title.medium} color={colors.text.primary} flex={1} numberOfLines={1}>
        {title}
      </AppText>
    </Row>
  );
}

const styles = StyleSheet.create({
  // Touch target не меньше 48 dp (MANUAL §10), при этом иконка остаётся размером токена.
  backTarget: {
    width: sizes.touch.android,
    height: sizes.touch.android,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppHeader;
