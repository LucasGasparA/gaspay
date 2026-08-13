import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../lib/theme-context';

/** Barra 20×3 acima do rótulo — o design não usa ícone, só esse indicador. */
function TabIndicator({ focused, color }: { focused: boolean; color: string }) {
  return <View style={[styles.indicator, focused && { backgroundColor: color }]} />;
}

export default function TabsLayout() {
  const { theme } = useTheme();
  const { colors, typography } = theme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 8,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: typography.size.caption },
        tabBarItemStyle: styles.item,
        tabBarIcon: ({ focused }) => <TabIndicator focused={focused} color={colors.brand} />,
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Início' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Extrato' }} />
      <Tabs.Screen name="goals" options={{ title: 'Metas' }} />
      <Tabs.Screen name="accounts" options={{ title: 'Contas' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  item: { paddingBottom: 6, gap: 4 },
  indicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
});
