import { lightTheme, monthStart } from '@dindim/shared';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '../components/Badge';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { DonutChart, type DonutSlice } from '../components/DonutChart';
import { useCategorySpend } from '../hooks/use-analytics';
import { useCategories } from '../hooks/use-categories';

const { colors, space, radius, typography } = lightTheme;

export default function Categories() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [kind, setKind] = useState<'expense' | 'income'>('expense');
  const { data, isLoading } = useCategories(kind);
  const categories = data?.items ?? [];

  const currentMonth = monthStart(new Date());
  const { data: spendData } = useCategorySpend(currentMonth);
  const slices = useMemo<DonutSlice[]>(
    () =>
      (spendData?.items ?? []).map((item) => ({
        name: item.categoryName,
        color: item.categoryColor,
        valueCents: Number(item.spentCents),
      })),
    [spendData],
  );
  const totalCents = spendData ? Number(spendData.totalCents) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.md }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backLabel}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Categorias</Text>
      </View>

      <View style={styles.tabs}>
        {(['expense', 'income'] as const).map((k) => {
          const active = k === kind;
          return (
            <Pressable
              key={k}
              onPress={() => setKind(k)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {k === 'expense' ? 'Despesas' : 'Receitas'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {kind === 'expense' && slices.length > 0 ? (
        <View style={styles.donutCard}>
          <DonutChart slices={slices} totalCents={totalCents} />
          <CategoryBreakdown slices={slices} totalCents={totalCents} />
        </View>
      ) : null}

      {isLoading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: space.lg }} />
      ) : (
        <View style={styles.list}>
          {categories.map((category, index) => (
            <View
              key={category.id}
              style={[styles.row, index !== categories.length - 1 && styles.rowBorder]}
            >
              <Badge letter={category.name.charAt(0).toUpperCase()} color={category.color} />
              <Text style={styles.rowName}>{category.name}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.newCategory}>+ Nova categoria</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.lg },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLabel: { color: colors.text, fontSize: 16 },
  title: { fontSize: typography.size.title, fontWeight: typography.weight.semibold, color: colors.text },
  tabs: { flexDirection: 'row', gap: space.sm, marginBottom: space.lg },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  tabLabel: { fontSize: 14, fontWeight: typography.weight.medium, color: colors.textSecondary },
  tabLabelActive: { color: colors.onBrand },
  donutCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    alignItems: 'center',
    gap: space.md,
    marginBottom: space.md,
  },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 14, paddingHorizontal: space.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowName: { flex: 1, fontSize: typography.size.body, color: colors.text },
  chevron: { color: colors.textTertiary, fontSize: typography.size.body },
  newCategory: {
    marginTop: space.md,
    textAlign: 'center',
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    color: colors.brand,
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
  },
});
