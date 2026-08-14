import { lightTheme } from '@dindim/shared';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { Wordmark } from '../components/Wordmark';
import { signInWithGoogle } from '../lib/auth-client';

const { colors, space, typography } = lightTheme;

/**
 * Só existe login via Google (`emailAndPassword: { enabled: false }` em
 * `apps/api/src/auth.ts`, decisão deliberada) — por isso a tela não mostra
 * campos de e-mail/senha nem "esqueci minha senha", que não têm nenhum
 * fluxo real por trás. Ver DDM-1.
 */
export default function Login() {
  const insets = useSafeAreaInsets();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    if (pending) return;
    setError(null);
    setPending(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await signInWithGoogle();
      // Sem `result.error` e sem sessão: o usuário só cancelou o picker do
      // Google — não é erro, não mostra mensagem nenhuma.
      if (result.error) {
        setError('Não consegui entrar. Verifique se este e-mail tem acesso liberado.');
      }
    } catch {
      setError('Sem conexão. Verifique sua internet e tente de novo.');
    } finally {
      setPending(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <View style={styles.logo}>
          <Wordmark onBrand />
        </View>
        <Text style={styles.title}>
          Oi, bem-vinda{'\n'}de volta
        </Text>
      </View>

      <View style={[styles.sheet, { paddingBottom: space.xl + insets.bottom }]}>
        <View style={styles.spacer} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <PrimaryButton
            label="Entrar com Google"
            onPress={() => void handleGoogle()}
            loading={pending}
            accessibilityLabel="Entrar com Google"
          />
          <Text style={styles.footer}>
            Ainda não tem conta?{' '}
            <Link href="/signup" asChild>
              <Text style={styles.footerLink}>Criar agora</Text>
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand },
  header: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  logo: { marginBottom: space.lg },
  title: { fontSize: 26, fontWeight: typography.weight.semibold, color: colors.onBrand, lineHeight: 32.5 },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
  },
  spacer: { flex: 1 },
  error: { fontSize: typography.size.footnote, color: colors.danger, textAlign: 'center', marginBottom: space.sm },
  actions: { gap: space.lg },
  footer: { textAlign: 'center', fontSize: 14, color: colors.textSecondary },
  footerLink: { color: colors.brand, fontWeight: typography.weight.semibold },
});
