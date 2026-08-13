import { digitsToCents, formatCents, lightTheme } from '@dindim/shared';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const { colors, typography } = lightTheme;

interface AmountInputProps {
  valueCents: bigint;
  onChangeCents: (cents: bigint) => void;
  /** Verde quando é entrada — despesa fica com a cor de texto normal. */
  tint?: string;
  /** Prefixo "R$" inline, como no formulário de lançamento. */
  currencyPrefix?: boolean;
}

/**
 * Dígitos entram pela direita, como numa calculadora: "1" "2" "5" "0" vira
 * 0,01 → 0,12 → 1,25 → 12,50. `digitsToCents` relê o texto formatado inteiro
 * a cada tecla, então não precisa de estado de cursor separado.
 */
export function AmountInput({ valueCents, onChangeCents, tint, currencyPrefix }: AmountInputProps) {
  const color = tint ? { color: tint } : null;
  const input = (
    <TextInput
      style={[styles.input, currencyPrefix && styles.inputInline, color]}
      value={formatCents(valueCents, { currency: false })}
      onChangeText={(text) => onChangeCents(digitsToCents(text))}
      keyboardType="numeric"
      inputMode="numeric"
      placeholder="0,00"
      placeholderTextColor={colors.textTertiary}
    />
  );

  if (!currencyPrefix) return input;

  return (
    <View style={styles.row}>
      <Text style={[styles.prefix, color]}>R$</Text>
      {input}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline' },
  prefix: { fontSize: 44, fontWeight: typography.weight.semibold, color: colors.text },
  input: {
    fontSize: 44,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
    paddingVertical: 4,
  },
  inputInline: { marginLeft: 8 },
});
