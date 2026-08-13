import { formatCents, lightTheme, type AppTheme, type TransactionDTO } from '@dindim/shared';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from './Badge';

interface TransactionRowProps {
  transaction: TransactionDTO;
  isLast?: boolean;
  theme?: AppTheme;
}

export function TransactionRow({ transaction, isLast, theme = lightTheme }: TransactionRowProps) {
  const { colors, space, typography } = theme;
  const router = useRouter();
  const isIncome = transaction.kind === 'income';
  const categoryLabel =
    transaction.category?.name ?? (transaction.kind === 'transfer' ? 'Transferência' : 'Sem categoria');
  const color = transaction.category?.color ?? colors.textTertiary;

  return (
    <Pressable
      style={[styles.row, { gap: space.md }, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
      onPress={() => router.push({ pathname: '/transaction/[id]', params: { id: transaction.id } })}
    >
      <Badge letter={categoryLabel.charAt(0).toUpperCase()} color={color} theme={theme} />
      <View style={styles.middle}>
        <Text
          style={[styles.description, { fontWeight: typography.weight.medium, color: colors.text }]}
          numberOfLines={1}
        >
          {transaction.description}
        </Text>
        <Text style={[styles.category, { color: colors.textSecondary }]} numberOfLines={1}>
          {categoryLabel}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          { fontWeight: typography.weight.semibold, color: isIncome ? colors.income : colors.text },
        ]}
      >
        {isIncome ? '+' : ''}
        {formatCents(BigInt(transaction.amountCents))}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  middle: { flex: 1, minWidth: 0 },
  description: { fontSize: 15 },
  category: { fontSize: 13, marginTop: 2 },
  amount: { fontSize: 15, fontVariant: ['tabular-nums'] },
});
