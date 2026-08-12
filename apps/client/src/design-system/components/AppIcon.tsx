import { View } from 'react-native';

import { useColors } from '@/design-system/theme';
import { radii, sizes } from '@/design-system/tokens';

export interface AppIconProps {
  /** Имя глифа из спеков (`arrow-left`, `globe`, `check-circle`, ...). */
  name: string;
  /** Значение токена `$size.icon.*`; по умолчанию — medium. */
  size?: number;
  color?: string;
  /** Без label иконка считается декоративной и скрывается от screen reader. */
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * UISpec-тег `Icon`.
 *
 * ВРЕМЕННАЯ РЕАЛИЗАЦИЯ: библиотеки иконок в зависимостях клиента нет, а состав зависимостей
 * зафиксирован ADR задачи, поэтому глиф заменён токен-размерным плейсхолдером. Имя иконки
 * сохраняется в props и в `testID`, чтобы подмена реализации в `front-guest-002` не потребовала
 * правок в вызывающем коде.
 */
export function AppIcon({
  name,
  size = sizes.icon.medium,
  color,
  accessibilityLabel,
  testID,
}: AppIconProps) {
  const colors = useColors();
  const decorative = accessibilityLabel === undefined;
  return (
    <View
      testID={testID ?? `icon-${name}`}
      accessible={!decorative}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
      style={{
        width: size,
        height: size,
        borderRadius: radii[8],
        backgroundColor: color ?? colors.icon.primary,
      }}
    />
  );
}

export default AppIcon;
