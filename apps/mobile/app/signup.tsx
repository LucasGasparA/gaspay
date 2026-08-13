import { lightTheme } from '@dindim/shared';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Field } from '../components/Field';
import { PrimaryButton } from '../components/PrimaryButton';
import { signInWithGoogle } from '../lib/auth-client';

const { colors, space, radius, typography } = lightTheme;

function passwordStrength(password: string): { filled: number; label: string | null } {
  if (password.length === 0) return { filled: 0, label: null };
  if (password.length < 6) return { filled: 1, label: 'fraca' };
  if (password.length < 10) return { filled: 2, label: 'boa' };
  return { filled: 3, label: 'forte' };
}

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);

  async function handleSubmit() {
    if (pending) return;
    setError(null);
    setPending(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await signInWithGoogle();
    } catch {
      setError('Não consegui criar a conta. Verifique se este e-mail tem acesso liberado.');
    } finally {
      setPending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.backLabel}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Leva menos de um minuto.</Text>
      </View>

      <View style={[styles.sheet, { paddingBottom: space.xl + insets.bottom }]}>
        <Field label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" autoComplete="name" />
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="seuemail@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <View>
          <Field
            label="Criar senha"
            value={password}
            onChangeText={setPassword}
            placeholder="mínimo 8 caracteres"
            secure
            autoComplete="password-new"
          />
          <View style={styles.strengthRow}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  { backgroundColor: i < strength.filled ? colors.income : colors.border },
                ]}
              />
            ))}
            {strength.label ? <Text style={styles.strengthLabel}>{strength.label}</Text> : null}
          </View>
        </View>

        <View style={styles.spacer} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton label="Criar conta" onPress={() => void handleSubmit()} loading={pending} />
        <Text style={styles.legal}>Ao continuar, você aceita os termos de uso.</Text>
      </View>
    </KeyboardAvoidingView>
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
  title: { fontSize: 26, fontWeight: typography.weight.semibold, color: colors.onBrand, lineHeight: 32.5 },
  subtitle: { fontSize: 14, color: colors.onBrand, opacity: 0.85, marginTop: 4 },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: space.xl,
    paddingHorizontal: space.lg,
    gap: space.xl,
  },
  strengthRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: space.sm },
  strengthBar: { flex: 1, height: 4, borderRadius: radius.pill },
  strengthLabel: { fontSize: 11, color: colors.textSecondary, marginLeft: 4 },
  spacer: { flex: 1, minHeight: space.md },
  error: { fontSize: typography.size.footnote, color: colors.danger, textAlign: 'center' },
  legal: { fontSize: 12, color: colors.textTertiary, textAlign: 'center' },
});
