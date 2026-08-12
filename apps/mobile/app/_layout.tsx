import { InterTight_400Regular, InterTight_500Medium, InterTight_600SemiBold } from '@expo-google-fonts/inter-tight';
import { lightTheme } from '@financas/shared';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BiometricGate } from '../components/BiometricGate';
import { useSession } from '../lib/auth-client';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BiometricGate enabled={Boolean(session)}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: lightTheme.colors.background },
            }}
          />
        </BiometricGate>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
