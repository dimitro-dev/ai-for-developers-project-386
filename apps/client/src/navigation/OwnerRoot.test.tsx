import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';

import { OwnerRoot } from '@/navigation/OwnerRoot';

/**
 * P14: проверяем, что корень owner-навигации собирается и открывается на `SetupCheck`
 * (`initial="SetupCheck"` из `navigation.uispec.xml`) — без ухода в реальные экраны P15–P19,
 * которых ещё нет (заглушки `OwnerStubScreens`, testID `owner-stub-*`).
 */
describe('OwnerRoot', () => {
  it('открывается на SetupCheck — initial route корня', async () => {
    await render(
      <NavigationContainer>
        <OwnerRoot />
      </NavigationContainer>,
    );

    expect(screen.getByTestId('owner-stub-setup-check')).toBeTruthy();
    expect(screen.queryByTestId('owner-stub-onboarding-profile')).toBeNull();
    expect(screen.queryByTestId('owner-bottom-navigation')).toBeNull();
  });
});
