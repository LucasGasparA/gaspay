import { lightTheme, type AppTheme } from '@dindim/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface EmptyStateProps {
  /** Um emoji só — sem asset de ilustração no projeto ainda. */
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  theme?: AppTheme;
}

/**
 * Estado vazio "de verdade": ícone grande, copy convidativa em primeira
 * pessoa, botão de ação — não só uma frase cinza. É o que faz a primeira
 * abertura do app (sem dado nenhum) não parecer quebrada.
 */
export function EmptyState({ icon, title, subtitle, actionLabel, onAction, theme = lightTheme }: EmptyStateProps) {
  const { colors, space, radius, typography } = theme;
  return (
    <View style={[styles.container, { paddingVertical: space.xl, paddingHorizontal: space.lg }]}>
      <View
        style={[
          styles.iconCircle,
          { borderRadius: radius.pill, backgroundColor: colors.brandSubtle, marginBottom: space.md },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text
        style={[styles.title, { fontWeight: typography.weight.semibold, color: colors.text, fontSize: typography.size.title }]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: colors.textSecondary, marginTop: space.xs, fontSize: typography.size.body },
        ]}
      >
        {subtitle}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          style={[
            styles.button,
            {
              marginTop: space.lg,
              backgroundColor: colors.brand,
              borderRadius: radius.pill,
              paddingVertical: space.sm,
              paddingHorizontal: space.lg,
            },
          ]}
          onPress={onAction}
        >
          <Text style={[styles.buttonLabel, { color: colors.onBrand, fontWeight: typography.weight.medium, fontSize: typography.size.body }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  iconCircle: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 32 },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', maxWidth: 260 },
  button: {},
  buttonLabel: {},
});
