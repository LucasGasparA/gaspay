import { lightTheme, type AppTheme } from '@dindim/shared';
import { Image, StyleSheet, Text, View } from 'react-native';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size: number;
  theme?: AppTheme;
}

/**
 * Foto real do Google quando existe (`me.user.image`, já vem preenchida
 * automaticamente no cadastro via OAuth); cai pras iniciais quando não tem
 * — mesmo comportamento de antes, só como fallback agora (ver DDM-9a).
 */
export function Avatar({ name, imageUrl, size, theme = lightTheme }: AvatarProps) {
  const { colors, radius, typography } = theme;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, borderRadius: radius.pill }}
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: radius.pill, backgroundColor: colors.brandSubtle },
      ]}
    >
      <Text style={[styles.letters, { color: colors.brand, fontSize: size * 0.36, fontWeight: typography.weight.semibold }]}>
        {name ? initials(name) : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  letters: {},
});
