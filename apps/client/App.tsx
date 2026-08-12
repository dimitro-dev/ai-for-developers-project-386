import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { configureApiClient } from '@/api/config';
import { GuestFlowProvider } from '@/features/guest/state/GuestFlowProvider';
import { GuestStack } from '@/navigation/GuestStack';

// Bootstrap: экспортируемый `client` generated SDK создан без baseUrl, поэтому конфигурация
// применяется здесь — до первого рендера и до любого запроса экранов (ADR §4).
configureApiClient();

// `linking` не настраивается сознательно (ADR §1): состояние навигации не уезжает в URL,
// объектный параметр `booking` и черновик формы (PII) остаются в памяти JS.
export default function App() {
  return (
    <SafeAreaProvider>
      <GuestFlowProvider>
        <NavigationContainer>
          <GuestStack />
        </NavigationContainer>
      </GuestFlowProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
