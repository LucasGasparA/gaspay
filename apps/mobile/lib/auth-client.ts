import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { apiUrl } from './config';
import { hydrateSecureSyncStorage, secureSyncStorage } from './secure-sync-storage';

const STORAGE_PREFIX = 'dindim';

export const authClient = createAuthClient({
  baseURL: apiUrl,
  plugins: [
    // A inferência de tipo do expoClient não fecha contra BetterAuthClientPlugin
    // nesta combinação de versões — funciona normalmente em runtime.
    // @ts-expect-error — ver comentário acima.
    expoClient({
      scheme: 'dindim',
      storagePrefix: STORAGE_PREFIX,
      storage: secureSyncStorage,
    }),
  ],
});

/**
 * Chama antes de renderizar qualquer coisa que use `useSession()`. Sem isso o
 * cache síncrono do storage está vazio no boot e a sessão salva nunca é lida
 * de volta — o app volta pro login mesmo com o token no SecureStore.
 */
export function hydrateAuthStorage(): Promise<void> {
  return hydrateSecureSyncStorage([`${STORAGE_PREFIX}_cookie`, `${STORAGE_PREFIX}_session_data`]);
}

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
