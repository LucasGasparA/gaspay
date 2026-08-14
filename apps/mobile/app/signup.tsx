import { lightTheme } from '@dindim/shared';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { Wordmark } from '../components/Wordmark';
import { signInWithGoogle } from '../lib/auth-client';

const { colors, space, typography } = lightTheme;

/**
 * Só existe cadastro via Google — mesmo motivo do login (ver login.tsx).
 * Sem campos de nome/e-mail/senha decorativos: a conta é criada com um
 * toque, usando os dados da conta Google. Ver DDM-1.
 */
export default function SignUp() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (pending) return;
    setError(null);
    setPending(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await signInWithGoogle();
      // Sem `result.error` e sem sessão: o usuário só cancelou o picker do
      // Google — não é erro, não mostra mensagem nenhuma.
      if (result.error) {
        setError('Não consegui criar a conta. Verifique se este e-mail tem acesso liberado.');
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
        <Pressable
          style={styles.back}
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <Text style={styles.backLabel}>‹</Text>
        </Pressable>
        <View style={styles.logo}>
          <Wordmark onBrand />
        </View>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Leva menos de um minuto.</Text>
      </View>

      <View style={[styles.sheet, { paddingBottom: space.xl + insets.bottom }]}>
        <Text style={styles.explainer}>
          Sua conta é criada automaticamente com sua conta Google — sem senha pra lembrar.
        </Text>

        <View style={styles.spacer} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          label="Continuar com Google"
          onPress={() => void handleSubmit()}
          loading={pending}
          accessibilityLabel="Criar conta com Google"
        />
        <Text style={styles.legal}>Ao continuar, você aceita os termos de uso.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand },
  header: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  back: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.onBrand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  backLabel: { fontSize: 15, color: colors.brand },
  logo: { marginBottom: space.lg },
  title: { fontSize: 26, fontWeight: typography.weight.semibold, color: colors.onBrand, lineHeight: 32.5 },
  subtitle: { fontSize: 14, color: colors.onBrand, opacity: 0.85, marginTop: 4 },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
  },
  explainer: { fontSize: typography.size.body, color: colors.textSecondary, lineHeight: 22 },
  spacer: { flex: 1, minHeight: space.md },
  error: { fontSize: typography.size.footnote, color: colors.danger, textAlign: 'center', marginBottom: space.sm },
  legal: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: space.md },
});
