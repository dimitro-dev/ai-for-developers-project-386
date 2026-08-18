import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Динамическая надстройка над `app.json`: единственная её задача — базовый префикс web-экспорта.
 * `expo export --platform web` адресует ассеты абсолютно от корня (`/_expo/static/...`), поэтому
 * бандл, который раздаётся не с корня сайта (владельческий — с `/admin`), без префикса просил бы
 * их из чужого бандла.
 *
 * Переменная намеренно не `EXPO_PUBLIC_*`: её значение нужно конфигу в момент запуска Expo CLI,
 * а не коду внутри бандла, и инлайнить его в бандл не требуется. Пустая или незаданная
 * переменная не меняет конфиг — dev-запуск и гостевой экспорт остаются без префикса.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const baseUrl = process.env.EXPO_WEB_BASE_URL?.trim() ?? '';
  if (baseUrl === '') {
    return config as ExpoConfig;
  }

  return {
    ...(config as ExpoConfig),
    experiments: { ...config.experiments, baseUrl },
  };
};
