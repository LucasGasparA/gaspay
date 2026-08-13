import { lightTheme } from '@dindim/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionForm, type TransactionFormValues } from '../../components/TransactionForm';
import { useDeleteTransaction, useTransaction, useUpdateTransaction } from '../../hooks/use-transactions';

const { colors, space, typography } = lightTheme;

export default function EditTransaction() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const { data: transaction, isLoading } = useTransaction(id);
  const updateTransaction = useUpdateTransaction(id ?? '');
  const deleteTransaction = useDeleteTransaction();

  async function handleSubmit(values: TransactionFormValues) {
    await updateTransaction.mutateAsync({
      accountId: values.accountId,
      categoryId: values.categoryId,
      amountCents: values.amountCents.toString(),
      kind: values.kind,
      occurredAt: values.occurredAt.toISOString(),
      description: values.description,
      notes: values.notes || null,
    });
    router.back();
  }

  async function handleDelete() {
    if (!id) return;
    await deleteTransaction.mutateAsync(id);
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
        <Text style={styles.title}>Lançamento</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeLabel}>✕</Text>
        </Pressable>
      </View>

      {isLoading || !transaction ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: space.xl }} />
      ) : transaction.kind === 'transfer' ? (
        <Text style={styles.notice}>Transferências não são editadas por aqui — exclua e lance de novo.</Text>
      ) : (
        <TransactionForm
          submitLabel="Salvar alterações"
          initialValues={{
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            amountCents: BigInt(transaction.amountCents),
            kind: transaction.kind,
            description: transaction.description,
            notes: transaction.notes ?? '',
          }}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
  },
  title: { fontSize: typography.size.title, fontWeight: typography.weight.semibold, color: colors.text },
  closeButton: { padding: space.xs },
  closeLabel: { color: colors.textTertiary, fontSize: typography.size.body },
  notice: {
    marginTop: space.xl,
    marginHorizontal: space.lg,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: typography.size.body,
  },
});
