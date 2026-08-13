import { lightTheme } from '@dindim/shared';
import { StyleSheet, Text, View } from 'react-native';
import { FormGroup } from './FormGroup';

const { colors, space, typography } = lightTheme;

export function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FormGroup bordered>{children}</FormGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: space.md },
  title: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginHorizontal: 4,
    marginBottom: space.sm,
  },
});
