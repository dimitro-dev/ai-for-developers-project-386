import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentType } from 'react';

import { useColors } from '@/design-system/theme';
import { sizes } from '@/design-system/tokens';

/**
 * Имена глифов из спеков UISpec. Union, а не `string`: имя иконки — контракт кита, и опечатку
 * должен ловить компилятор. Новое имя добавляется сюда только вслед за спекой.
 */
export type IconName =
  | 'alert-circle'
  | 'alert-triangle'
  | 'arrow-left'
  | 'calendar'
  | 'calendar-x'
  | 'check-circle'
  | 'chevron-right'
  | 'clock'
  | 'cloud-off'
  | 'event-type'
  | 'globe'
  | 'info'
  | 'mail'
  | 'user';

/**
 * Семейства `@expo/vector-icons` типизированы каждое своим union имён глифов, поэтому общего
 * типа у них нет: `name` сужается до `never` в пересечении. Дальше имя глифа приводится точечно —
 * его корректность гарантирует словарь ниже, а не вызывающий код.
 */
type GlyphFamily = ComponentType<{
  name: never;
  size: number;
  color: string;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityElementsHidden?: boolean;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}>;

interface Glyph {
  readonly family: GlyphFamily;
  readonly glyph: string;
}

const feather = Feather as unknown as GlyphFamily;
const materialCommunity = MaterialCommunityIcons as unknown as GlyphFamily;

/**
 * Основное семейство — Feather: 12 из 14 имён спеков совпадают с его глифами буквально.
 * Двум именам прямого глифа в Feather нет, они берутся из MaterialCommunityIcons того же пакета:
 * `calendar-x` → `calendar-remove`, `event-type` → `forum` (парный речевой пузырь кадров 1–7
 * `guest-mobile-flow.png`).
 */
const GLYPHS: Readonly<Record<IconName, Glyph>> = {
  'alert-circle': { family: feather, glyph: 'alert-circle' },
  'alert-triangle': { family: feather, glyph: 'alert-triangle' },
  'arrow-left': { family: feather, glyph: 'arrow-left' },
  calendar: { family: feather, glyph: 'calendar' },
  'calendar-x': { family: materialCommunity, glyph: 'calendar-remove' },
  'check-circle': { family: feather, glyph: 'check-circle' },
  'chevron-right': { family: feather, glyph: 'chevron-right' },
  clock: { family: feather, glyph: 'clock' },
  'cloud-off': { family: feather, glyph: 'cloud-off' },
  'event-type': { family: materialCommunity, glyph: 'forum' },
  globe: { family: feather, glyph: 'globe' },
  info: { family: feather, glyph: 'info' },
  mail: { family: feather, glyph: 'mail' },
  user: { family: feather, glyph: 'user' },
};

export interface AppIconProps {
  /** Имя глифа из спеков (`arrow-left`, `globe`, `check-circle`, ...). */
  name: IconName;
  /** Значение токена `$size.icon.*`; по умолчанию — medium. */
  size?: number;
  color?: string;
  /** Без label иконка считается декоративной и скрывается от screen reader. */
  accessibilityLabel?: string;
  testID?: string;
}

/** UISpec-тег `Icon`. */
export function AppIcon({
  name,
  size = sizes.icon.medium,
  color,
  accessibilityLabel,
  testID,
}: AppIconProps) {
  const colors = useColors();
  const decorative = accessibilityLabel === undefined;
  const { family: GlyphComponent, glyph } = GLYPHS[name];

  return (
    <GlyphComponent
      // testID несёт имя спеки, а не глифа: тесты и живые прогоны ссылаются на словарь кита.
      testID={testID ?? `icon-${name}`}
      name={glyph as never}
      size={size}
      color={color ?? colors.icon.primary}
      accessible={!decorative}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
    />
  );
}

export default AppIcon;
