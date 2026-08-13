import { lightTheme } from '@dindim/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const { colors, space, radius, typography } = lightTheme;

interface FormRowProps {
  label: string;
  value?: string;
  color?: string | null;
  onPress?: () => void;
  isLast?: boolean;
}

/** Linha label/valor com "›" quando é acionável — usada no form de lançamento e no perfil. */
export function FormRow({ label, value, color, onPress, isLast }: FormRowProps) {
  return (
    <Pressable style={[styles.row, !isLast && styles.rowBorder]} onPress={onPress} disabled={!onPress}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueGroup}>
        {color ? <View style={[styles.dot, { backgroundColor: color }]} /> : null}
        {value ? (
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {onPress ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: space.md,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { fontSize: typography.size.body, color: colors.textSecondary },
  valueGroup: { flexDirection: 'row', alignItems: 'center', gap: space.xs, maxWidth: '65%' },
  dot: { width: 10, height: 10, borderRadius: radius.pill, flexShrink: 0 },
  value: { fontSize: typography.size.body, fontWeight: typography.weight.medium, color: colors.text },
  chevron: { color: colors.textTertiary, fontSize: typography.size.body },
});
