import { lightTheme } from '@dindim/shared';
import { Pressable, StyleSheet, Text } from 'react-native';

const { colors } = lightTheme;

interface TextLinkProps {
  label: string;
  onPress?: () => void;
}

export function TextLink({ label, onPress }: TextLinkProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} hitSlop={8}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, color: colors.textSecondary, textAlign: 'center' },
});
