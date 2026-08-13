import { lightTheme } from '@dindim/shared';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextLink } from '../components/TextLink';
import { signInWithGoogle } from '../lib/auth-client';

const { colors, space, typography } = lightTheme;

export default function Login() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <View style={styles.logo}>
          <Text style={styles.logoLetter}>D</Text>
        </View>
        <Text style={styles.title}>
          Oi, bem-vinda{'\n'}de volta
        </Text>
      </View>

      <View style={[styles.sheet, { paddingBottom: space.xl + insets.bottom }]}>
        <View style={styles.fields}>
          <Field label="E-mail" value={email} onChangeText={setEmail} placeholder="seuemail@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Field label="Senha" value={password} onChangeText={setPassword} placeholder="Sua senha" secure autoComplete="password" />
        </View>

        <View style={styles.spacer} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          <PrimaryButton label="Entrar" onPress={() => void handleGoogle()} loading={pending} />
          <TextLink label="Esqueci minha senha" />
          <View style={styles.divider} />
          <TextLink label="Entrar com Google" onPress={() => void handleGoogle()} />
          <Text style={styles.footer}>
            Ainda não tem conta?{' '}
            <Link href="/signup" asChild>
              <Text style={styles.footerLink}>Criar agora</Text>
            </Link>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.brand },
  header: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.onBrand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  logoLetter: { fontSize: 18, fontWeight: typography.weight.semibold, color: colors.brand },
  title: { fontSize: 26, fontWeight: typography.weight.semibold, color: colors.onBrand, lineHeight: 32.5 },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
  },
  fields: { gap: space.xl },
  spacer: { flex: 1, minHeight: space.xl },
  error: { fontSize: typography.size.footnote, color: colors.danger, textAlign: 'center', marginBottom: space.sm },
  actions: { gap: space.lg },
  divider: { height: 1, backgroundColor: colors.border },
  footer: { textAlign: 'center', fontSize: 14, color: colors.textSecondary },
  footerLink: { color: colors.brand, fontWeight: typography.weight.semibold },
});
