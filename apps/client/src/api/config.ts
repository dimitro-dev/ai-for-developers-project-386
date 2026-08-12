import { client } from '@minical/api-client';
import { Platform } from 'react-native';

/** Prism-мок `task-infra-004` — дефолт разработки. Реальный API — `http://localhost:3001`. */
export const DEFAULT_API_BASE_URL = 'http://localhost:4010';

/** Android-эмулятор видит хост-машину как `10.0.2.2`; `localhost` внутри эмулятора — он сам. */
export const ANDROID_DEFAULT_API_BASE_URL = 'http://10.0.2.2:4010';

export function resolveApiBaseUrl(): string {
  // Expo инлайнит EXPO_PUBLIC_* только при статическом обращении через точку:
  // деструктуризация и process.env[key] не инлайнятся и в сборке дадут undefined.
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (configured !== undefined && configured.trim() !== '') {
    return configured.trim();
  }

  return Platform.select({
    android: ANDROID_DEFAULT_API_BASE_URL,
    default: DEFAULT_API_BASE_URL,
  });
}

/**
 * Экспортируемый `client` создан без `baseUrl` (`task-infra-005`): без этого вызова
 * запросы уходят по относительному адресу. Вызывается bootstrap приложения до первого рендера.
 */
export function configureApiClient(): void {
  client.setConfig({ baseUrl: resolveApiBaseUrl() });
}
