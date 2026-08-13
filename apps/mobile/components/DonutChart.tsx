import { formatCents, lightTheme } from '@dindim/shared';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { colors, typography } = lightTheme;

export interface DonutSlice {
  name: string;
  color: string;
  valueCents: number;
}

interface DonutChartProps {
  slices: DonutSlice[];
  totalCents: number;
  size?: number;
  thickness?: number;
}

/** Anel de fatias contíguas — mesma matemática do protótipo: dasharray acumulado, início no topo. */
export function DonutChart({ slices, totalCents, size = 168, thickness = 22 }: DonutChartProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {slices.map((slice) => {
          const length = totalCents > 0 ? (slice.valueCents / totalCents) * circumference : 0;
          const element = (
            <Circle
              key={slice.name}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-accumulated}
            />
          );
          accumulated += length;
          return element;
        })}
      </Svg>
      <View style={styles.center}>
        <Text style={styles.centerLabel}>Total do mês</Text>
        <Text style={styles.centerValue}>{formatCents(BigInt(totalCents))}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  svg: { transform: [{ rotate: '-90deg' }] },
  center: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  centerLabel: { fontSize: typography.size.caption, color: colors.textSecondary },
  centerValue: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});
