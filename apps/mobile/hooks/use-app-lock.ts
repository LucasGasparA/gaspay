import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

/** Depois de tanto tempo em background, a próxima volta pede biometria de novo. */
const RELOCK_AFTER_MS = 60_000;

export interface AppLock {
  /** `true` enquanto a tela precisa ficar escondida atrás do prompt biométrico. */
  locked: boolean;
  /** Dispara o prompt de novo — usado pelo botão "tentar de novo" na tela travada. */
  retry: () => void;
}

/**
 * Trava o app com biometria na abertura e ao voltar do background depois de
 * `RELOCK_AFTER_MS`. Só entra em ação quando `enabled` é true — não faz
 * sentido travar a tela de login.
 */
export function useAppLock(enabled: boolean): AppLock {
  const [locked, setLocked] = useState(enabled);
  const backgroundedAt = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const authenticate = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    // Sem biometria configurada no aparelho, não dá pra exigir — deixa passar
    // em vez de trancar o usuário fora do próprio app.
    if (!hasHardware || !isEnrolled) {
      setLocked(false);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Destrave o Finanças',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });

    setLocked(!result.success);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLocked(false);
      return;
    }

    setLocked(true);
    void authenticate();
  }, [enabled, authenticate]);

  useEffect(() => {
    if (!enabled) return;

    const subscription = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/active/) && next === 'background') {
        backgroundedAt.current = Date.now();
      }

      if (appState.current === 'background' && next === 'active') {
        const elapsed = backgroundedAt.current ? Date.now() - backgroundedAt.current : Number.POSITIVE_INFINITY;
        if (elapsed > RELOCK_AFTER_MS) {
          setLocked(true);
          void authenticate();
        }
      }

      appState.current = next;
    });

    return () => subscription.remove();
  }, [enabled, authenticate]);

  return { locked, retry: () => void authenticate() };
}
