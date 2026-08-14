import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { type ColorValue } from 'react-native';
import { FloatingTabBar } from '../../components/FloatingTabBar';
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

export default function TabsLayout() {
  const { theme } = useTheme();
  const { colors, typography } = theme;

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontSize: typography.size.caption },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarAccessibilityLabel: 'Início',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} outline="home-outline" filled="home" />
          ),
        }}
      />
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
        name="accounts"
        options={{
          title: 'Contas',
          tabBarAccessibilityLabel: 'Contas',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} outline="wallet-outline" filled="wallet" />
          ),
        }}
      />
      {/* Fora da tab bar (DDM-9) — continua acessível via avatar da Home / router.push('/profile'). */}
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
