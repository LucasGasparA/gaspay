import { lightTheme } from '@financas/shared';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '../lib/api';
import { signOut, useSession } from '../lib/auth-client';

const { colors, space, radius, typography } = lightTheme;

interface Me {
  user: { id: string; name: string; email: string; image: string | null };
  session: { expiresAt: string };
}

export default function Home() {
  const { data: session } = useSession();
  const insets = useSafeAreaInsets();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    apiFetch<Me>('/api/me')
      .then(setMe)
      .catch(() => setError('Não consegui carregar seus dados.'));
  }, [session]);

  // Guarda contra acesso direto via deep link sem sessão válida.
  if (!session) return <Redirect href="/login" />;

  return (
    <View style={[styles.container, { paddingTop: insets.top + space.lg }]}>
      <Text style={styles.greeting}>
        {me ? `Oi, ${me.user.name.split(' ')[0]}` : error ? error : 'Carregando…'}
      </Text>

      {!me && !error ? <ActivityIndicator color={colors.brand} style={{ marginTop: space.md }} /> : null}

      <View style={{ flex: 1 }} />

      <Pressable style={styles.signOutButton} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
  greeting: {
    fontSize: typography.size.heading,
    fontWeight: typography.weight.semibold,
    color: colors.text,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutText: {
    color: colors.textSecondary,
    fontSize: typography.size.body,
  },
});
