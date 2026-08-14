// `BottomTabBarProps` não é reexportado pelo pacote público `expo-router` —
// só pelo módulo interno que o `Tabs` embrulha (é o próprio bottom-tabs do
// react-navigation, vendorizado; ver `node_modules/expo-router/build/react-navigation/bottom-tabs`).
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/theme-context';

/** Rota que existe no grupo (tabs) mas não aparece na barra — ver DDM-9. */
const HIDDEN_ROUTES = new Set(['profile']);

/** Barra flutuante: cantos arredondados, margem das bordas, sombra. */
export function FloatingTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const { theme } = useTheme();
  const { colors, typography, radius } = theme;

  const routes = state.routes.filter((route) => !HIDDEN_ROUTES.has(route.name));

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.bar, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg + 4 }]}>
        {routes.map((route) => {
          const index = state.routes.indexOf(route);
          const { options } = descriptors[route.key] ?? {};
          const focused = state.index === index;
          const label = options?.title ?? route.name;
          const color = focused ? colors.brand : colors.textTertiary;

          function onPress() {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.item}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? label}
            >
              {options?.tabBarIcon?.({ focused, color, size: 22 })}
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  { fontSize: typography.size.caption, color, fontWeight: focused ? typography.weight.semibold : typography.weight.regular },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingTop: 8 },
  bar: {
    flexDirection: 'row',
    borderWidth: 1,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 40 },
  label: {},
});
