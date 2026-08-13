import { lightTheme, type AppTheme } from '@dindim/shared';
import { StyleSheet, Text, View } from 'react-native';

interface BadgeProps {
  letter: string;
  color: string;
  size?: number;
  theme?: AppTheme;
}

/** Círculo com a inicial da categoria — cor a ~10% de fundo, cor cheia no texto. */
export function Badge({ letter, color, size = 40, theme = lightTheme }: BadgeProps) {
  const { radius, typography } = theme;
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: radius.pill, backgroundColor: `${color}1A` },
      ]}
    >
      <Text style={[styles.letter, { color, fontSize: size * 0.4, fontWeight: typography.weight.semibold }]}>
        {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  letter: {},
});
