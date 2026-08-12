import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { apiUrl } from './config';

export const authClient = createAuthClient({
  baseURL: apiUrl,
  plugins: [
    // A inferência de tipo do expoClient não fecha contra BetterAuthClientPlugin
    // nesta combinação de versões — funciona normalmente em runtime.
    // @ts-expect-error — ver comentário acima.
    expoClient({
      scheme: 'financas',
      storagePrefix: 'financas',
      storage: SecureStore,
    }),
  ],
});

export const { useSession, signOut } = authClient;

/** Abre o navegador no fluxo do Google; o servidor cuida do resto. */
export function signInWithGoogle(): Promise<unknown> {
  return authClient.signIn.social({ provider: 'google', callbackURL: '/' });
}

interface ExpoClientActions {
  getCookie: () => string;
}

/**
 * Cookie de sessão pra anexar nas chamadas às rotas próprias da API — o
 * plugin expo do Better Auth não anexa isso sozinho fora dos endpoints
 * `/api/auth/*`. `getCookie` some do tipo de `authClient` pelo mesmo motivo
 * do `@ts-expect-error` acima; em runtime ele existe.
 */
export function getSessionCookie(): string {
  return (authClient as unknown as ExpoClientActions).getCookie();
}
