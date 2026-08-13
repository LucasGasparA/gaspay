import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { useTheme } from '../../lib/theme-context';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface TabIconProps {
  focused: boolean;
  color: ColorValue;
  outline: IoniconName;
  filled: IoniconName;
}

/** Outline quando inativa, cheio quando ativa — o peso maior já marca o estado, sem depender só da cor. */
function TabIcon({ focused, color, outline, filled }: TabIconProps) {
  return <Ionicons name={focused ? filled : outline} size={22} color={color} />;
}

interface HomeTabIconProps {
  brand: string;
  onBrand: string;
}

/**
 * Início é a aba central e recebe tratamento elevado — círculo `brand` que
 * flutua acima da linha da tab bar, maior que os ícones normais (ver DDM-5).
 * O placeholder de 22px preserva a mesma altura de layout dos outros ícones,
 * pra não empurrar o rótulo de texto embaixo — o círculo em si é absoluto e
 * "vaza" pra cima sem afetar os vizinhos.
 */
function HomeTabIcon({ brand, onBrand }: HomeTabIconProps) {
  return (
    <View style={styles.homeIconSlot}>
      <View style={[styles.homeIconCircle, { backgroundColor: brand }]}>
        <Ionicons name="home" size={26} color={onBrand} />
      </View>
    </View>
  );
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
      }}
    >
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Extrato',
          tabBarAccessibilityLabel: 'Extrato',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} outline="receipt-outline" filled="receipt" />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Metas',
          tabBarAccessibilityLabel: 'Metas',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} outline="flag-outline" filled="flag" />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarAccessibilityLabel: 'Início',
          tabBarIcon: () => <HomeTabIcon brand={colors.brand} onBrand={colors.onBrand} />,
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Contas',
          tabBarAccessibilityLabel: 'Contas',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} outline="wallet-outline" filled="wallet" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} outline="person-circle-outline" filled="person-circle" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  item: { paddingBottom: 6, gap: 4 },
  homeIconSlot: { height: 22, width: 22, alignItems: 'center', overflow: 'visible' },
  homeIconCircle: {
    position: 'absolute',
    top: -26,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});
