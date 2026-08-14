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

export interface SignInResult {
  /**
   * `null` tanto em sucesso quanto quando o usuário só cancelou o picker do
   * Google (o cliente Expo do Better Auth trata isso como não-erro, sem
   * lançar exceção) — só vem preenchido numa falha real do próprio pedido de
   * login (ex.: servidor fora do ar). Rejeição por allowlist acontece depois,
   * no callback do OAuth, e não chega até aqui.
   */
  error: { message?: string } | null;
}

/**
 * Abre o navegador no fluxo do Google; o servidor cuida do resto. Não lança
 * exceção para falha de login em si (ver `SignInResult.error`) — só uma
 * falha de rede de verdade (ex.: sem internet) rejeita a promise.
 */
export function signInWithGoogle(): Promise<SignInResult> {
  return authClient.signIn.social({ provider: 'google', callbackURL: '/' }) as Promise<SignInResult>;
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
