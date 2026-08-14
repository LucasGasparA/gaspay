import { lightTheme } from '@dindim/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Switch } from './Switch';

const { colors, space, typography } = lightTheme;

interface SettingRowProps {
  label: string;
  hint?: string;
  value?: string;
  toggle?: boolean;
  on?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  isLast?: boolean;
}

export function SettingRow({ label, hint, value, toggle, on = false, onToggle, onPress, isLast }: SettingRowProps) {
  const body = (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.textGroup}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {toggle ? (
        <Switch value={on} onValueChange={onToggle} />
      ) : (
        <View style={styles.valueGroup}>
          {value ? <Text style={styles.value}>{value}</Text> : null}
          {onPress ? <Text style={styles.chevron}>›</Text> : null}
        </View>
      )}
    </View>
  );

  if (!onPress) return body;
  return <Pressable onPress={onPress}>{body}</Pressable>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 14,
    paddingHorizontal: space.md,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  textGroup: { flex: 1, minWidth: 0 },
  label: { fontSize: typography.size.body, color: colors.text },
  hint: { fontSize: typography.size.caption, color: colors.textSecondary, marginTop: 2 },
  valueGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  value: { fontSize: 14, color: colors.textSecondary },
  chevron: { color: colors.textTertiary, fontSize: typography.size.body },
});
