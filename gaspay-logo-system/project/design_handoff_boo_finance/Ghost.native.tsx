import { memo, useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { GHOST_COLORS, GHOST_PX } from './ghost-pixels';

type GhostProps = { size?: number; float?: boolean };

/**
 * Mascote pixel art. Uma View por pixel opaco (max 256) — memoizado, sem imagem.
 * float: sobe/desce em 2 quadros, combinando com o pixel art (nada de easing suave).
 */
export const Ghost = memo(function Ghost({ size = 72, float = false }: GhostProps) {
  const cols = GHOST_PX[0].length;
  const px = size / cols;
  const y = useSharedValue(0);

  useEffect(() => {
    if (!float) return;
    y.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1700, easing: Easing.steps(2, true) }),
        withTiming(0, { duration: 1700, easing: Easing.steps(2, true) }),
      ),
      -1,
    );
  }, [float]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Animated.View style={[{ width: cols * px, height: GHOST_PX.length * px }, style]}>
      {GHOST_PX.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', height: px }}>
          {row.split('').map((c, ci) => (
            <View key={ci} style={{ width: px, height: px, backgroundColor: GHOST_COLORS[c] }} />
          ))}
        </View>
      ))}
    </Animated.View>
  );
});
