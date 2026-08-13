import { lightTheme } from '@dindim/shared';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

const { colors, space, radius } = lightTheme;

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function PrimaryButton({ label, onPress, loading, disabled, accessibilityLabel }: PrimaryButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? <ActivityIndicator color={colors.onBrand} /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space.sm,
  },
  pressed: { backgroundColor: colors.brandPressed },
  label: { color: colors.onBrand, fontSize: 16, fontWeight: '600' },
});
