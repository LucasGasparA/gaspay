import { InterTight_400Regular, InterTight_500Medium, InterTight_600SemiBold } from '@expo-google-fonts/inter-tight';
import { lightTheme } from '@financas/shared';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BiometricGate } from '../components/BiometricGate';
import { hydrateAuthStorage, useSession } from '../lib/auth-client';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/**
 * `useSession()` só pode ser chamado depois que `hydrateAuthStorage()`
 * termina — senão o cache síncrono do storage está vazio e a sessão salva
 * nunca é lida de volta. Por isso esse componente só monta (e só então chama
 * o hook) depois do gate de hidratação em `RootLayout`.
 */
function AuthenticatedRoot() {
  const [fontsLoaded] = useFonts({
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_600SemiBold,
  });
  const { data: session, isPending: sessionPending } = useSession();

  const ready = fontsLoaded && !sessionPending;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <BiometricGate enabled={Boolean(session)}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: lightTheme.colors.background },
        }}
      />
    </BiometricGate>
  );
}

export default function RootLayout() {
  const [storageHydrated, setStorageHydrated] = useState(false);

  useEffect(() => {
    hydrateAuthStorage()
      .catch((error: unknown) => console.error('[auth] falha ao hidratar storage', error))
      .finally(() => setStorageHydrated(true));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>{storageHydrated ? <AuthenticatedRoot /> : null}</SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
