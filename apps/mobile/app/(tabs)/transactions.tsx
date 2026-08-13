import { dayKey, formatDayLabel, lightTheme, type TransactionDTO } from '@dindim/shared';
import { Link, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { TransactionRow } from '../../components/TransactionRow';
import { useTransactions } from '../../hooks/use-transactions';

const { colors, space, radius, typography } = lightTheme;

type Filter = 'all' | 'income' | 'expense';

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'income', label: 'Entradas' },
  { id: 'expense', label: 'Saídas' },
];

interface Section {
  title: string;
  data: TransactionDTO[];
}

function groupByDay(transactions: TransactionDTO[]): Section[] {
  const sections: Section[] = [];
  let currentKey: string | null = null;

  for (const transaction of transactions) {
    const occurredAt = new Date(transaction.occurredAt);
    const key = dayKey(occurredAt);

    if (key !== currentKey) {
      sections.push({ title: formatDayLabel(occurredAt), data: [transaction] });
      currentKey = key;
    } else {
      sections[sections.length - 1]?.data.push(transaction);
    }
  }

  return sections;
}

export default function Transactions() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Espera parar de digitar antes de refazer a busca — senão cada tecla vira request.
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch, isRefetching } =
    useTransactions({ kind: filter === 'all' ? undefined : filter, search: search || undefined });

  const sections = useMemo(() => groupByDay(data?.pages.flatMap((page) => page.items) ?? []), [data]);
  const hasActiveFilter = filter !== 'all' || search !== '';

  return (
    <View style={[styles.container, { paddingTop: insets.top + space.md }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Extrato</Text>
        <Link href="/transaction/new" asChild>
          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonLabel}>+</Text>
          </Pressable>
        </Link>
      </View>

      <TextInput
        style={styles.search}
        value={searchInput}
        onChangeText={setSearchInput}
        placeholder="Buscar transação"
        placeholderTextColor={colors.textTertiary}
      />

      <View style={styles.filters}>
        {filters.map((f) => {
          const active = f.id === filter;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: space.xl }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index, section }) => (
            <TransactionRow transaction={item} isLast={index === section.data.length - 1} />
          )}
          renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          renderSectionFooter={() => <View style={styles.sectionFooter} />}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasNextPage) void fetchNextPage();
          }}
          ListEmptyComponent={
            hasActiveFilter ? (
              <Text style={styles.empty}>Nenhum lançamento encontrado com esse filtro.</Text>
            ) : (
              <EmptyState
                icon="📝"
                title="Seu extrato está vazio"
                subtitle="Toque em “+” pra registrar sua primeira despesa ou receita."
                actionLabel="Lançar agora"
                onAction={() => router.push('/transaction/new')}
              />
            )
          }
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={colors.brand} /> : null}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: space.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  title: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.semibold,
    color: colors.text,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonLabel: {
    color: colors.onBrand,
    fontSize: typography.size.title,
    fontWeight: typography.weight.medium,
    marginTop: -2,
  },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: typography.size.body,
    color: colors.text,
    marginBottom: space.md,
  },
  filters: { flexDirection: 'row', gap: space.sm, marginBottom: space.lg },
  filterChip: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterLabel: { fontSize: typography.size.footnote, fontWeight: typography.weight.medium, color: colors.textSecondary },
  filterLabelActive: { color: colors.onBrand },
  listContent: { paddingBottom: space.xl },
  sectionHeader: {
    fontSize: typography.size.footnote,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingBottom: space.sm,
  },
  sectionFooter: { height: space.lg },
  empty: {
    textAlign: 'center',
    color: colors.textTertiary,
    marginTop: space.xl,
    fontSize: typography.size.body,
  },
});
