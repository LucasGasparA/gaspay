import { lightTheme } from '@dindim/shared';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

const { colors, space, radius } = lightTheme;

interface FabProps {
  onPress?: () => void;
  accessibilityLabel?: string;
}

/**
 * Ponto de acesso persistente pra lançar uma transação — vive em Home e
 * Extrato, não só dentro do estado vazio. 56×56 (o mínimo recomendado de
 * toque é 44×44). Ver DDM-2.
 */
export function Fab({ onPress, accessibilityLabel = 'Nova transação' }: FabProps) {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      onPress={onPress ?? (() => router.push('/transaction/new'))}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.plus}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: space.lg,
    bottom: space.lg,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  pressed: { backgroundColor: colors.brandPressed },
  plus: { color: colors.onBrand, fontSize: 28, fontWeight: '600', marginTop: -2 },
});
