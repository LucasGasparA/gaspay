import type { ExpoConfig } from 'expo/config';

/**
 * App de uso pessoal, sideload direto no S23 — não vai pra Play Store, então
 * não há motivo pra separar dev/preview/prod por `EAS_BUILD_PROFILE`: sempre
 * o mesmo app, apontando pra API local ou pra do Railway via env var.
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.10:3000';

const config: ExpoConfig = {
  name: 'Finanças',
  slug: 'financas',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  // Sem isso o navegador que faz o login Google não sabe voltar pro app.
  scheme: 'financas',
  primaryColor: '#820AD1',
  android: {
    package: 'com.financas.mobile',
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-web-browser',
    'expo-font',
    'expo-splash-screen',
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Usar biometria para destravar o app.',
      },
    ],
  ],
  extra: {
    apiUrl,
  },
};

export default config;
