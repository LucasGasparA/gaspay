import { Redirect } from 'expo-router';
import { useSession } from '../lib/auth-client';

/**
 * `_layout.tsx` só libera a árvore depois que a sessão termina de carregar,
 * então aqui é só decidir pra onde ir.
 */
export default function Index() {
  const { data: session } = useSession();

  return <Redirect href={session ? '/home' : '/login'} />;
}
