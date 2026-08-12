import { lightTheme } from '@financas/shared';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { signInWithGoogle } from '../lib/auth-client';

const { colors, space, radius, typography } = lightTheme;

export default function Login() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePress() {
    if (pending) return;

    setError(null);
    setPending(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await signInWithGoogle();
    } catch {
      setError('Não consegui entrar. Verifique se este e-mail tem acesso liberado.');
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>Finanças</Text>
        <Text style={styles.tagline}>Seu dinheiro, sem enrolação.</Text>
      </View>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handlePress}
          disabled={pending}
        >
          {pending ? (
            <ActivityIndicator color={colors.onBrand} />
          ) : (
            <Text style={styles.buttonText}>Entrar com Google</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingVertical: space.xl * 2,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordmark: {
    fontSize: typography.size.hero,
    fontWeight: typography.weight.semibold,
    color: colors.brand,
  },
  tagline: {
    marginTop: space.sm,
    fontSize: typography.size.body,
    color: colors.textSecondary,
  },
  footer: {
    gap: space.md,
  },
  error: {
    fontSize: typography.size.footnote,
    color: colors.danger,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    paddingVertical: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.brandPressed,
  },
  buttonText: {
    color: colors.onBrand,
    fontSize: typography.size.callout,
    fontWeight: typography.weight.medium,
  },
});
