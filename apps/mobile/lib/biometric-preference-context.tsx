import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'biometric-lock-enabled';

interface BiometricPreferenceContextValue {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  /** `false` até o valor persistido ser lido do SecureStore. */
  ready: boolean;
}

const BiometricPreferenceContext = createContext<BiometricPreferenceContextValue | null>(null);

/**
 * Preferência de travar o app com biometria, persistida no SecureStore (mesmo
 * armazenamento seguro usado pra sessão — ver `secure-sync-storage.ts`). Fica
 * num Context de nível de app porque é lida em `_layout.tsx` (decide se o
 * `BiometricGate` trava) e alterada no Perfil — os dois precisam enxergar o
 * mesmo valor ao vivo, não cópias independentes de `useState`.
 */
export function BiometricPreferenceProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((value) => {
        if (value !== null) setEnabledState(value === 'true');
      })
      .catch((error: unknown) => console.error('[biometric-preference] falha ao ler preferência', error))
      .finally(() => setReady(true));
  }, []);

  const setEnabled = (value: boolean) => {
    setEnabledState(value);
    SecureStore.setItemAsync(STORAGE_KEY, String(value)).catch((error: unknown) => {
      console.error('[biometric-preference] falha ao gravar preferência', error);
    });
  };

  return (
    <BiometricPreferenceContext.Provider value={{ enabled, setEnabled, ready }}>
      {children}
    </BiometricPreferenceContext.Provider>
  );
}

export function useBiometricPreference(): BiometricPreferenceContextValue {
  const ctx = useContext(BiometricPreferenceContext);
  if (!ctx) throw new Error('useBiometricPreference precisa estar dentro de um BiometricPreferenceProvider');
  return ctx;
}
