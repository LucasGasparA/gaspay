import { lightTheme } from '@dindim/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';

const { colors, space } = lightTheme;

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secure?: boolean;
  error?: string | null;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'name' | 'password' | 'password-new' | 'off';
}

/** Campo sublinhado sem caixa — a linha muda de cor por foco/erro, como no protótipo. */
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secure,
  error,
  keyboardType,
  autoCapitalize = 'sentences',
  autoComplete,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const lineColor = error ? colors.danger : focused ? colors.brand : colors.border;

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, { borderBottomColor: lineColor }]}>
        <TextInput
          style={[styles.input, secure && !reveal ? styles.inputSecure : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secure && !reveal}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secure ? (
          <Pressable onPress={() => setReveal((prev) => !prev)} hitSlop={8}>
            <Text style={styles.reveal}>{reveal ? 'ocultar' : 'ver'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingBottom: 10,
    borderBottomWidth: 2,
  },
  input: { flex: 1, fontSize: 17, color: colors.text, paddingVertical: 0 },
  inputSecure: { letterSpacing: 2 },
  reveal: { fontSize: 13, fontWeight: '500', color: colors.brand },
  error: { fontSize: 12, color: colors.danger, marginTop: 6 },
});
