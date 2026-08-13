import { lightTheme } from '@dindim/shared';
import { Pressable, StyleSheet, View } from 'react-native';

const { colors, radius } = lightTheme;

interface SwitchProps {
  value: boolean;
  onValueChange?: (value: boolean) => void;
}

export function Switch({ value, onValueChange }: SwitchProps) {
  return (
    <Pressable
      onPress={() => onValueChange?.(!value)}
      style={[styles.track, value && styles.trackOn]}
      hitSlop={8}
    >
      <View style={[styles.thumb, value && styles.thumbOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.brand },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    marginLeft: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  thumbOn: { marginLeft: 21 },
});
