import * as SecureStore from 'expo-secure-store';

/**
 * O adapter de storage do `@better-auth/expo` chama `getItem` de forma
 * síncrona (não dá `await`) — mas o SecureStore só tem API assíncrona nesta
 * versão. Por isso um cache em memória fica na frente: `hydrateSecureSyncStorage`
 * carrega tudo do SecureStore antes do app renderizar qualquer coisa que
 * dependa de sessão, e daí pra frente as leituras são síncronas de verdade.
 *
 * Sem isso a sessão nunca é lida de volta no boot — o app sempre volta pra
 * tela de login mesmo com o token salvo no disco.
 */
const cache = new Map<string, string>();

export const secureSyncStorage = {
  getItem(key: string): string | null {
    return cache.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    cache.set(key, value);
    void SecureStore.setItemAsync(key, value).catch((error: unknown) => {
      console.error(`[secure-sync-storage] falha ao gravar "${key}"`, error);
    });
  },
};

const MAX_CHUNKS = 20;

/**
 * Carrega uma chave-base e seus possíveis fragmentos `<key>.0..N` (o
 * `@better-auth/expo` quebra valores grandes em pedaços — ver
 * `storageAdapter` em `@better-auth/expo/client`) pro cache síncrono.
 */
async function hydrateKey(baseKey: string): Promise<void> {
  const value = await SecureStore.getItemAsync(baseKey);
  if (value !== null) cache.set(baseKey, value);

  for (let i = 0; i < MAX_CHUNKS; i++) {
    const chunkKey = `${baseKey}.${i}`;
    const chunk = await SecureStore.getItemAsync(chunkKey);
    if (chunk === null) break;
    cache.set(chunkKey, chunk);
  }
}

export async function hydrateSecureSyncStorage(baseKeys: string[]): Promise<void> {
  await Promise.all(baseKeys.map(hydrateKey));
}
