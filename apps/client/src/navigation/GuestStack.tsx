import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GuestBookingConfirmationStubScreen } from '@/features/guest/screens/GuestBookingConfirmationStubScreen';
import { GuestBookingFormStubScreen } from '@/features/guest/screens/GuestBookingFormStubScreen';
import { GuestEventTypesStubScreen } from '@/features/guest/screens/GuestEventTypesStubScreen';
import { GuestSlotsStubScreen } from '@/features/guest/screens/GuestSlotsStubScreen';

import { guestStackInitialRoute, type GuestStackParamList } from './GuestStackParamList';

const Stack = createNativeStackNavigator<GuestStackParamList>();

/**
 * `<Stack id="GuestStack">` из `navigation.uispec.xml`. Каркас переживёт `front-guest-002`:
 * та задача меняет содержимое экранов, а не состав route и не типы параметров.
 *
 * Заголовок навигатора выключен: спеки экранов рисуют собственный тег `Header`
 * (`AppHeader`) внутри `Layout`, второй системный заголовок был бы дублем.
 */
export function GuestStack() {
  return (
    <Stack.Navigator initialRouteName={guestStackInitialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuestEventTypes" component={GuestEventTypesStubScreen} />
      <Stack.Screen name="GuestSlots" component={GuestSlotsStubScreen} />
      <Stack.Screen name="GuestBookingForm" component={GuestBookingFormStubScreen} />
      <Stack.Screen
        name="GuestBookingConfirmation"
        component={GuestBookingConfirmationStubScreen}
      />
    </Stack.Navigator>
  );
}

export default GuestStack;
