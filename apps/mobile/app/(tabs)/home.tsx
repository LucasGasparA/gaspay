import { centsToWordsPtBR, daysLeftInMonth, formatCents, monthStart, sumCents } from '@dindim/shared';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { Fab } from '../../components/Fab';
import { FlowChart } from '../../components/FlowChart';
import { ProgressBar } from '../../components/ProgressBar';
import { TransactionRow } from '../../components/TransactionRow';
import { useAccounts } from '../../hooks/use-accounts';
import { useMonthlyFlow } from '../../hooks/use-analytics';
import { useBudgets } from '../../hooks/use-budgets';
import { useMe } from '../../hooks/use-me';
import { useMonthSummary, useRecentTransactions } from '../../hooks/use-transactions';
import { useTheme } from '../../lib/theme-context';

const WEEKDAYS_FULL = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
] as const;

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
] as const;

function todayLabel(): string {
  const now = new Date();
  const weekday = WEEKDAYS_FULL[now.getDay()];
  const month = MONTHS[now.getMonth()];
  const weekdayCapitalized = weekday ? weekday.charAt(0).toUpperCase() + weekday.slice(1) : '';
  return `${weekdayCapitalized}, ${now.getDate()} de ${month}`;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { colors, space, radius, typography } = theme;
  const { data: me } = useMe();
  const {
    data: accountsData,
    isLoading: accountsLoading,
    isRefetching: accountsRefetching,
    refetch: refetchAccounts,
  } = useAccounts();
  const { data: monthSummary, refetch: refetchSummary } = useMonthSummary();
  const { data: recent, isLoading: recentLoading, refetch: refetchRecent } = useRecentTransactions(5);
  const currentMonth = monthStart(new Date());
  const { data: budgetsData, refetch: refetchBudgets } = useBudgets(currentMonth);
  const { data: flowData, refetch: refetchFlow } = useMonthlyFlow(6);

  const totalBalanceCents = useMemo(
    () => sumCents((accountsData?.items ?? []).map((a) => BigInt(a.balanceCents))),
    [accountsData],
  );

  const flowNetCents = useMemo(() => {
    if (!flowData || flowData.length === 0) return null;
    const income = sumCents(flowData.map((d) => BigInt(d.incomeCents)));
    const expense = sumCents(flowData.map((d) => BigInt(d.expenseCents)));
    return income - expense;
  }, [flowData]);

  const projectedExpenseCents = useMemo(() => {
    if (!monthSummary) return null;
    const expenseSoFar = Number(monthSummary.expenseCents);
    if (expenseSoFar <= 0) return null;
    const now = new Date();
    const daysElapsed = now.getDate();
    const daysInMonth = daysElapsed + daysLeftInMonth(now) - 1;
    if (daysElapsed >= daysInMonth) return null;
    const dailyAverage = expenseSoFar / daysElapsed;
    return BigInt(Math.round(dailyAverage * daysInMonth));
  }, [monthSummary]);

  const isLoading = accountsLoading || recentLoading;
  const hasAccounts = (accountsData?.items.length ?? 0) > 0;

  function handleRefresh() {
    void refetchAccounts();
    void refetchSummary();
    void refetchRecent();
    void refetchBudgets();
    void refetchFlow();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: space.lg, paddingBottom: space.xl, gap: space.xl, paddingTop: insets.top + space.md },
        ]}
        refreshControl={<RefreshControl refreshing={accountsRefetching} onRefresh={handleRefresh} />}
      >
      <View style={styles.greetingRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.text, fontWeight: typography.weight.semibold }]}>
            Oi, {me?.user.name.split(' ')[0] ?? '...'}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{todayLabel()}</Text>
        </View>
        <View style={[styles.avatar, { borderRadius: radius.pill, backgroundColor: colors.brandSubtle }]}>
          <Text style={[styles.avatarLabel, { color: colors.brand, fontWeight: typography.weight.semibold }]}>
            {me ? initials(me.user.name) : ''}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: space.xl }} />
      ) : !hasAccounts ? (
        <EmptyState
          icon="🪙"
          title="Vamos começar?"
          subtitle="Crie sua primeira conta pra registrar o que você ganha e gasta — leva menos de um minuto."
          actionLabel="Criar minha primeira conta"
          onAction={() => router.push('/account/new')}
          theme={theme}
        />
      ) : (
        <>
          <View>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Saldo total</Text>
            <Text
              style={[styles.balanceValue, { color: colors.text, fontWeight: typography.weight.semibold }]}
              accessibilityLabel={`Saldo total: ${centsToWordsPtBR(totalBalanceCents)}`}
            >
              {formatCents(totalBalanceCents)}
            </Text>
            <View style={[styles.summaryRow, { gap: space.xl, marginTop: space.md }]}>
              <View>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Entradas</Text>
                <Text
                  style={[styles.summaryValue, { color: colors.income, fontWeight: typography.weight.semibold }]}
                >
                  +{formatCents(monthSummary?.incomeCents ?? 0n)}
                </Text>
              </View>
              <View>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Saídas</Text>
                <Text style={[styles.summaryValue, { color: colors.text, fontWeight: typography.weight.semibold }]}>
                  {formatCents(monthSummary?.expenseCents ?? 0n)}
                </Text>
              </View>
            </View>
            {projectedExpenseCents !== null && (
              <Text style={[styles.projection, { color: colors.textSecondary, marginTop: space.md }]}>
                Nesse ritmo, você deve fechar o mês gastando {formatCents(projectedExpenseCents)}.
              </Text>
            )}
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, borderColor: colors.border },
            ]}
          >
            <View style={[styles.cardHeader, { marginBottom: space.md }]}>
              <Text style={[styles.cardTitle, { color: colors.text, fontWeight: typography.weight.semibold }]}>
                Últimos 6 meses
              </Text>
              {flowNetCents !== null && (
                <Text
                  style={[
                    styles.cardDelta,
                    { color: flowNetCents >= 0 ? colors.income : colors.text, fontWeight: typography.weight.medium },
                  ]}
                >
                  {flowNetCents >= 0 ? '+' : ''}
                  {formatCents(flowNetCents)}
                </Text>
              )}
            </View>
            {flowData ? (
              <FlowChart data={flowData} theme={theme} />
            ) : (
              <ActivityIndicator color={colors.brand} />
            )}
          </View>

          <View>
            <Text
              style={[styles.sectionTitle, { color: colors.text, fontWeight: typography.weight.semibold, marginBottom: space.md }]}
            >
              Orçamentos do mês
            </Text>
            {(budgetsData?.items ?? []).length === 0 ? (
              <Text style={[styles.empty, { color: colors.textTertiary }]}>
                Nenhum orçamento definido pra esse mês ainda.
              </Text>
            ) : (
              <View style={{ gap: space.md }}>
                {(budgetsData?.items ?? []).map((budget) => {
                  const spent = BigInt(budget.spentCents);
                  const limit = BigInt(budget.limitCents);
                  const pct = limit > 0n ? Number((spent * 100n) / limit) : 0;
                  const over = spent > limit;
                  return (
                    <View key={budget.id}>
                      <View style={[styles.budgetHeader, { gap: space.sm }]}>
                        <Text style={[styles.budgetName, { color: colors.text, fontWeight: typography.weight.medium }]}>
                          {budget.categoryName}
                        </Text>
                        <Text style={[styles.budgetAmounts, { color: over ? colors.danger : colors.textSecondary }]}>
                          {formatCents(spent)} de {formatCents(limit)}
                        </Text>
                      </View>
                      <ProgressBar pct={pct} color={over ? colors.danger : budget.categoryColor} theme={theme} />
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View>
            <Text
              style={[styles.sectionTitle, { color: colors.text, fontWeight: typography.weight.semibold, marginBottom: space.sm }]}
            >
              Últimas transações
            </Text>
            {(recent?.items ?? []).length === 0 ? (
              <EmptyState
                icon="📝"
                title="Nenhum lançamento ainda"
                subtitle="Toque em “Novo” no Extrato pra registrar sua primeira despesa ou receita."
                actionLabel="Lançar agora"
                onAction={() => router.push('/transaction/new')}
                theme={theme}
              />
            ) : (
              (recent?.items ?? []).map((transaction, index, all) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  isLast={index === all.length - 1}
                  theme={theme}
                />
              ))
            )}
          </View>
        </>
      )}
      </ScrollView>
      <Fab accessibilityLabel="Nova transação" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {},
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24 },
  date: { fontSize: 13, marginTop: 2 },
  avatar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { fontSize: 15 },
  balanceLabel: { fontSize: 13 },
  balanceValue: { fontSize: 36, marginTop: 4, fontVariant: ['tabular-nums'] },
  summaryRow: { flexDirection: 'row' },
  projection: { fontSize: 13 },
  summaryLabel: { fontSize: 12 },
  summaryValue: { fontSize: 15, marginTop: 2 },
  card: { borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  cardTitle: { fontSize: 15 },
  cardDelta: { fontSize: 12 },
  sectionTitle: { fontSize: 17 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  budgetName: { fontSize: 13 },
  budgetAmounts: { fontSize: 13 },
  empty: { textAlign: 'center', fontSize: 15, marginTop: 8 },
});
