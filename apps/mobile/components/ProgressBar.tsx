import { lightTheme, type AppTheme } from '@dindim/shared';
import { StyleSheet, View } from 'react-native';

interface ProgressBarProps {
  pct: number;
  color?: string;
  height?: number;
  theme?: AppTheme;
}

export function ProgressBar({ pct, color, height = 6, theme = lightTheme }: ProgressBarProps) {
  const { colors, radius } = theme;
  const clamped = Math.min(Math.max(pct, 0), 100);
  return (
    <View style={[styles.track, { height, borderRadius: radius.pill, backgroundColor: colors.border }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped}%`, backgroundColor: color ?? colors.brand, borderRadius: radius.pill },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden' },
  fill: { height: '100%' },
});
