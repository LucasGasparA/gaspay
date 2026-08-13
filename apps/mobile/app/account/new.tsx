import { accountTypeLabels, accountTypes, lightTheme, type AccountType } from '@dindim/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AmountInput } from '../../components/AmountInput';
import { FormGroup } from '../../components/FormGroup';
import { FormRow } from '../../components/FormRow';
import { PickerModal } from '../../components/PickerModal';
import { useCreateAccount } from '../../hooks/use-accounts';

const { colors, space, radius, typography } = lightTheme;

const typeOptions = accountTypes.map((type) => ({ id: type, label: accountTypeLabels[type] }));

export default function NewAccount() {
  const router = useRouter();
  const createAccount = useCreateAccount();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [initialBalanceCents, setInitialBalanceCents] = useState<bigint>(0n);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Dê um nome à conta.');
      return;
    }

    setError(null);
    try {
      await createAccount.mutateAsync({
        name: name.trim(),
        type,
        initialBalanceCents: initialBalanceCents.toString(),
      });
      router.back();
    } catch {
      setError('Não consegui criar a conta. Tenta de novo.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nova conta</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeLabel}>✕</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.amountWrap}>
          <AmountInput valueCents={initialBalanceCents} onChangeCents={setInitialBalanceCents} />
          <Text style={styles.amountLabel}>Saldo inicial</Text>
        </View>

        <FormGroup>
          <View style={styles.textRow}>
            <Text style={styles.textRowLabel}>Nome</Text>
            <TextInput
              style={styles.textRowInput}
              value={name}
              onChangeText={setName}
              placeholder="Ex.: Nubank"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <FormRow label="Tipo" value={accountTypeLabels[type]} onPress={() => setPickerOpen(true)} isLast />
        </FormGroup>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.submitButton} onPress={() => void handleSubmit()} disabled={createAccount.isPending}>
          {createAccount.isPending ? (
            <ActivityIndicator color={colors.onBrand} />
          ) : (
            <Text style={styles.submitLabel}>Criar conta</Text>
          )}
        </Pressable>
      </ScrollView>

      <PickerModal
        visible={pickerOpen}
        title="Tipo de conta"
        options={typeOptions}
        selectedId={type}
        onSelect={(id) => setType(id as AccountType)}
        onClose={() => setPickerOpen(false)}
      />
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
    paddingTop: space.xl,
  },
  title: { fontSize: typography.size.title, fontWeight: typography.weight.semibold, color: colors.text },
  closeButton: { padding: space.xs },
  closeLabel: { color: colors.textSecondary, fontSize: typography.size.body },
  content: { padding: space.lg, paddingBottom: space.xl * 2 },
  amountWrap: { alignItems: 'center', paddingVertical: space.lg },
  amountLabel: { fontSize: typography.size.footnote, color: colors.textSecondary, marginTop: space.xs },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  textRowLabel: { fontSize: typography.size.body, color: colors.textSecondary },
  textRowInput: {
    flex: 1,
    marginLeft: space.md,
    textAlign: 'right',
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
    color: colors.text,
    paddingVertical: 8,
  },
  error: {
    color: colors.danger,
    fontSize: typography.size.footnote,
    marginTop: space.sm,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: space.lg,
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  submitLabel: { color: colors.onBrand, fontSize: typography.size.callout, fontWeight: typography.weight.medium },
});
