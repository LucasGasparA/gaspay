import { lightTheme } from '@financas/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppLock } from '../hooks/use-app-lock';

const { colors, space, radius, typography } = lightTheme;

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

  if (!locked) return <>{children}</>;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      <Text style={styles.title}>Finanças travado</Text>
      <Text style={styles.subtitle}>Use a biometria para continuar.</Text>
      <Pressable style={styles.button} onPress={retry}>
        <Text style={styles.buttonText}>Tentar de novo</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    zIndex: 999,
  },
  title: {
    fontSize: typography.size.heading,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    marginBottom: space.xs,
  },
  subtitle: {
    fontSize: typography.size.body,
    color: colors.textSecondary,
    marginBottom: space.lg,
  },
  button: {
    backgroundColor: colors.brand,
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
  buttonText: {
    color: colors.onBrand,
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
  },
});
