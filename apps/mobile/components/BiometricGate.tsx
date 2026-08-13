import { lightTheme } from '@dindim/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppLock } from '../hooks/use-app-lock';
import { useMe } from '../hooks/use-me';
import { signOut } from '../lib/auth-client';

const { colors, space, radius, typography } = lightTheme;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}

/**
 * Cobre a tela inteira enquanto `useAppLock` espera a biometria. Fica por
 * cima de qualquer outra coisa renderizada — inclusive dados sensíveis que já
 * estavam na tela antes do app ir pro background.
 */
interface BiometricGateProps {
  enabled: boolean;
  children: React.ReactNode;
}

export function BiometricGate({ enabled, children }: BiometricGateProps) {
  const { locked, retry } = useAppLock(enabled);
  const { data: me } = useMe();

  if (!locked) return <>{children}</>;

  const firstName = me?.user.name.split(' ')[0] ?? '';

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.center}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{me ? initials(me.user.name) : ''}</Text>
        </View>
        <Text style={styles.greeting}>Oi de novo{firstName ? `, ${firstName}` : ''}</Text>
        <Text style={styles.subtitle}>Use a digital para desbloquear o Dindim.</Text>
        <Pressable style={styles.fingerprintRing} onPress={retry} hitSlop={12}>
          <View style={styles.fingerprintOuter}>
            <View style={styles.fingerprintInner} />
          </View>
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Text style={styles.usePassword}>Usar senha</Text>
        <Pressable onPress={() => void signOut()} hitSlop={8}>
          <Text style={styles.switchAccount}>Trocar de conta</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: { fontSize: 18, fontWeight: typography.weight.semibold, color: colors.onBrand },
  greeting: { fontSize: typography.size.title, fontWeight: typography.weight.semibold, color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', maxWidth: 230 },
  fingerprintRing: {
    marginTop: space.lg,
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintOuter: {
    width: 42,
    height: 50,
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
    borderBottomLeftRadius: 19,
    borderBottomRightRadius: 19,
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fingerprintInner: {
    width: 26,
    height: 34,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    borderWidth: 2,
    borderColor: colors.brand,
    opacity: 0.5,
  },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    paddingBottom: space.xl,
    gap: space.md,
  },
  usePassword: { textAlign: 'center', fontSize: 14, fontWeight: typography.weight.medium, color: colors.brand },
  switchAccount: { textAlign: 'center', fontSize: 13, color: colors.textSecondary },
});
