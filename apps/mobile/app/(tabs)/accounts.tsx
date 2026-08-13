import { accountTypeLabels, formatCents, lightTheme, sumCents, type AccountDTO } from '@dindim/shared';
import { Link, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { useAccounts } from '../../hooks/use-accounts';

const { colors, space, radius, typography } = lightTheme;

function AccountRow({ account, isLast }: { account: AccountDTO; isLast: boolean }) {
  const negative = BigInt(account.balanceCents) < 0n;
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={[styles.dot, { backgroundColor: account.color ?? colors.brand }]} />
      <View style={styles.rowMiddle}>
        <Text style={styles.rowName}>{account.name}</Text>
        <Text style={styles.rowType}>{accountTypeLabels[account.type]}</Text>
      </View>
      <Text style={[styles.rowBalance, negative && { color: colors.danger }]}>
        {formatCents(BigInt(account.balanceCents))}
      </Text>
    </View>
  );
}

export default function Accounts() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading } = useAccounts();
  const accounts = data?.items ?? [];
  const hasAccounts = accounts.length > 0;

  const total = useMemo(() => sumCents(accounts.map((a) => BigInt(a.balanceCents))), [accounts]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.md }]}
    >
      <Text style={styles.title}>Contas</Text>

      {isLoading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: space.lg }} />
      ) : !hasAccounts ? (
        <EmptyState
          icon="🏦"
          title="Nenhuma conta ainda"
          subtitle="Cadastre sua conta corrente, poupança, cartão ou carteira pra começar a acompanhar seu saldo."
          actionLabel="Criar minha primeira conta"
          onAction={() => router.push('/account/new')}
        />
      ) : (
        <>
          <Text style={styles.subtitle}>Patrimônio líquido</Text>
          <Text style={styles.total}>{formatCents(total)}</Text>

          <View style={styles.card}>
            {accounts.map((account, index) => (
              <AccountRow key={account.id} account={account} isLast={index === accounts.length - 1} />
            ))}
          </View>

          <Link href="/account/new" asChild>
            <Text style={styles.newAccount}>+ Nova conta</Text>
          </Link>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  title: { fontSize: typography.size.display, fontWeight: typography.weight.semibold, color: colors.text },
  subtitle: { fontSize: typography.size.footnote, color: colors.textSecondary, marginTop: space.xs },
  total: {
    fontSize: 32,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    marginBottom: space.lg,
    fontVariant: ['tabular-nums'],
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  dot: { width: 10, height: 10, borderRadius: radius.pill, flexShrink: 0 },
  rowMiddle: { flex: 1 },
  rowName: { fontSize: typography.size.body, fontWeight: typography.weight.medium, color: colors.text },
  rowType: { fontSize: typography.size.footnote, color: colors.textSecondary, marginTop: 2 },
  rowBalance: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  newAccount: {
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
