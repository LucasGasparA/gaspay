import { lightTheme, type AppTheme } from '@dindim/shared';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from './Logo';

interface WordmarkProps {
  /** Lado da caixa da marca. Texto e raio escalam junto — referência do
   * `design_handoff_dindim/README.md` é 32 (caixa) / raio 9 / texto 24. */
  size?: number;
  theme?: AppTheme;
  /** Sobre fundo âmbar a caixa inverte pra branco (ver README) — passe `true` nesse caso. */
  onBrand?: boolean;
}

/** Marca + "Dindim" por extenso, lado a lado — ver README, seção Logo/Marca → Wordmark. */
export function Wordmark({ size = 32, theme = lightTheme, onBrand = false }: WordmarkProps) {
  const { colors, typography } = theme;
  const radiusRatio = 9 / 32;
  const fontSizeRatio = 24 / 32;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.mark,
          {
            width: size,
            height: size,
            borderRadius: size * radiusRatio,
            backgroundColor: onBrand ? colors.onBrand : colors.brand,
          },
        ]}
      >
        <Logo size={size * 0.75} />
      </View>
      <Text
        style={[
          styles.label,
          {
            fontSize: size * fontSizeRatio,
            fontWeight: typography.weight.semibold,
            color: onBrand ? colors.onBrand : colors.text,
          },
        ]}
      >
        Dindim
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  label: {},
});
