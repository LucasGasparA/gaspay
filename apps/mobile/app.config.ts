import type { ExpoConfig } from 'expo/config';

/**
 * App de uso pessoal, sideload direto no S23 — não vai pra Play Store, então
 * não há motivo pra separar dev/preview/prod por `EAS_BUILD_PROFILE`: sempre
 * o mesmo app, apontando pra API local ou pra do Railway via env var.
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.10:3000';

const config: ExpoConfig = {
  name: 'Dindim',
  slug: 'dindim',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  // Sem isso o navegador que faz o login Google não sabe voltar pro app.
  scheme: 'dindim',
  primaryColor: '#B8860B',
  android: {
    package: 'com.dindim.mobile',
    adaptiveIcon: {
      backgroundColor: '#B8860B',
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
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: '#B8860B',
      },
    ],
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Usar biometria para destravar o app.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Usar suas fotos para a foto de perfil.',
        cameraPermission: 'Usar a câmera para tirar uma foto de perfil.',
        // O app nunca grava áudio — sem motivo pra pedir microfone.
        microphonePermission: false,
      },
    ],
    // Ver o arquivo: contorna um bug de toolchain do NDK 27 + CMake 3.22.1
    // que faz o build nativo do Android falhar/crashar sem isso.
    './plugins/withAndroidCxxSharedLink.js',
  ],
  extra: {
    apiUrl,
  },
};

export default config;
