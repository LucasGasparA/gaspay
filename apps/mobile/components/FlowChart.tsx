import { lightTheme, type AppTheme } from '@dindim/shared';
import { StyleSheet, Text, View } from 'react-native';

export interface FlowChartPoint {
  month: string;
  incomeCents: number;
  expenseCents: number;
}

interface FlowChartProps {
  data: FlowChartPoint[];
  height?: number;
  theme?: AppTheme;
}

/** Barras pareadas entrada/saída por mês — mês atual em cor cheia, resto esmaecido. */
export function FlowChart({ data, height = 132, theme = lightTheme }: FlowChartProps) {
  const { colors, space, typography } = theme;
  const max = Math.max(...data.flatMap((d) => [d.incomeCents, d.expenseCents]));

  return (
    <View>
      <View style={[styles.bars, { height, marginBottom: space.sm }]}>
        {data.map((point, index) => {
          const isCurrent = index === data.length - 1;
          return (
            <View key={point.month} style={styles.barGroup}>
              <View
                style={[
                  styles.bar,
                  {
                    height: max > 0 ? (point.incomeCents / max) * height : 0,
                    backgroundColor: isCurrent ? colors.income : `${colors.income}59`,
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    height: max > 0 ? (point.expenseCents / max) * height : 0,
                    backgroundColor: isCurrent ? colors.brand : `${colors.brand}40`,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labels}>
        {data.map((point, index) => {
          const isCurrent = index === data.length - 1;
          return (
            <Text
              key={point.month}
              style={[
                styles.labelText,
                { color: isCurrent ? colors.text : colors.textTertiary },
                isCurrent && { fontWeight: typography.weight.medium },
              ]}
            >
              {point.month}
            </Text>
          );
        })}
      </View>
      <View style={[styles.legend, { gap: space.md, marginTop: space.md }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
          <Text style={[styles.legendLabel, { fontSize: typography.size.caption, color: colors.textSecondary }]}>
            Entradas
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.brand }]} />
          <Text style={[styles.legendLabel, { fontSize: typography.size.caption, color: colors.textSecondary }]}>
            Saídas
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  barGroup: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 3 },
  bar: { width: 9, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  labels: { flexDirection: 'row', gap: 14 },
  labelText: { flex: 1, textAlign: 'center', fontSize: 11 },
  legend: { flexDirection: 'row' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendLabel: {},
});
