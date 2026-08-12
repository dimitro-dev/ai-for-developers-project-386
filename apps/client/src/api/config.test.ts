import { client } from '@minical/api-client';

import {
  ANDROID_DEFAULT_API_BASE_URL,
  DEFAULT_API_BASE_URL,
  configureApiClient,
  resolveApiBaseUrl,
} from './config';

const ENV_KEY = 'EXPO_PUBLIC_API_BASE_URL';

describe('resolveApiBaseUrl', () => {
  const originalValue = process.env[ENV_KEY];

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = originalValue;
    }
  });

  it('без переменной окружения отдаёт Prism-дефолт', () => {
    delete process.env[ENV_KEY];

    expect(resolveApiBaseUrl()).toBe(DEFAULT_API_BASE_URL);
  });

  it('пустая переменная окружения считается незаданной', () => {
    process.env[ENV_KEY] = '   ';

    expect(resolveApiBaseUrl()).toBe(DEFAULT_API_BASE_URL);
  });

  it('переопределяется переменной окружения', () => {
    process.env[ENV_KEY] = 'http://localhost:3001';

    expect(resolveApiBaseUrl()).toBe('http://localhost:3001');
  });
});

describe('configureApiClient', () => {
  const originalValue = process.env[ENV_KEY];
  const originalBaseUrl = client.getConfig().baseUrl;

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = originalValue;
    }
    client.setConfig({ baseUrl: originalBaseUrl });
  });

  it('кладёт дефолтный base URL в конфигурацию generated-клиента', () => {
    delete process.env[ENV_KEY];

    configureApiClient();

    expect(client.getConfig().baseUrl).toBe(DEFAULT_API_BASE_URL);
  });

  it('кладёт значение из переменной окружения', () => {
    process.env[ENV_KEY] = 'http://localhost:3001';

    configureApiClient();

    expect(client.getConfig().baseUrl).toBe('http://localhost:3001');
  });
});

describe('дефолт Android-эмулятора', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('react-native');
  });

  it('на android отдаёт 10.0.2.2 вместо localhost', () => {
    // Платформа jest-окружения — ios (`haste.defaultPlatform` пресета), поэтому
    // android-ветку Platform.select проверяем на подменённом модуле; `select`
    // повторяет реализацию react-native/Libraries/Utilities/Platform.android.js.
    jest.resetModules();
    jest.doMock('react-native', () => ({
      Platform: {
        OS: 'android',
        select: <T,>(spec: { android?: T; native?: T; default?: T }): T | undefined =>
          'android' in spec ? spec.android : 'native' in spec ? spec.native : spec.default,
      },
    }));

    const reloaded: typeof import('./config') = require('./config');

    expect(reloaded.resolveApiBaseUrl()).toBe(ANDROID_DEFAULT_API_BASE_URL);
  });
});
