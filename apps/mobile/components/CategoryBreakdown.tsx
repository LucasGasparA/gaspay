import { formatCents, lightTheme } from '@dindim/shared';
import { StyleSheet, Text, View } from 'react-native';
import type { DonutSlice } from './DonutChart';

const { colors, space, typography } = lightTheme;

interface CategoryBreakdownProps {
  slices: DonutSlice[];
  totalCents: number;
}

export function CategoryBreakdown({ slices, totalCents }: CategoryBreakdownProps) {
  return (
    <View style={styles.container}>
      {slices.map((slice) => (
        <View key={slice.name} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: slice.color }]} />
          <Text style={styles.name}>{slice.name}</Text>
          <Text style={styles.percent}>
            {totalCents > 0 ? Math.round((slice.valueCents / totalCents) * 100) : 0}%
          </Text>
          <Text style={styles.value}>{formatCents(BigInt(slice.valueCents))}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  name: { flex: 1, fontSize: typography.size.footnote, color: colors.text },
  percent: { fontSize: typography.size.footnote, color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  value: {
    width: 78,
    textAlign: 'right',
    fontSize: typography.size.footnote,
    color: colors.text,
    fontWeight: typography.weight.medium,
    fontVariant: ['tabular-nums'],
  },
});
