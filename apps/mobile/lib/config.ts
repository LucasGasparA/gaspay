import Constants from 'expo-constants';

/**
 * Vem de `extra.apiUrl` em app.config.ts, que já resolve o fallback pro IP
 * local em dev. Ler daqui em vez de `process.env.EXPO_PUBLIC_API_URL` direto
 * garante que sempre existe um valor, mesmo sem a env var definida.
 */
export const apiUrl = (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? 'http://localhost:3000';
