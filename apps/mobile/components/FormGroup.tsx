import { lightTheme } from '@dindim/shared';
import { StyleSheet, View } from 'react-native';

const { colors, radius } = lightTheme;

/** Cartão que agrupa `FormRow`s ou `SettingRow`s — fundo surface, cantos arredondados. */
export function FormGroup({ children, bordered }: { children: React.ReactNode; bordered?: boolean }) {
  return <View style={[styles.group, bordered && styles.bordered]}>{children}</View>;
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
