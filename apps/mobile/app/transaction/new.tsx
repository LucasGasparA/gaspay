import { lightTheme } from '@dindim/shared';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionForm, type TransactionFormValues } from '../../components/TransactionForm';
import { useCreateTransaction } from '../../hooks/use-transactions';

const { colors, space, typography } = lightTheme;

export default function NewTransaction() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createTransaction = useCreateTransaction();

  async function handleSubmit(values: TransactionFormValues) {
    await createTransaction.mutateAsync({
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

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + space.md }]}>
        <Text style={styles.title}>Nova transação</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeLabel}>✕</Text>
        </Pressable>
      </View>
      <TransactionForm submitLabel="Salvar" onSubmit={handleSubmit} />
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
  closeLabel: { color: colors.textSecondary, fontSize: typography.size.body },
});
