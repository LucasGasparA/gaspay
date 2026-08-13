import { lightTheme } from '@dindim/shared';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAccounts } from '../hooks/use-accounts';
import { useCategories } from '../hooks/use-categories';
import { AmountInput } from './AmountInput';
import { FormGroup } from './FormGroup';
import { FormRow } from './FormRow';
import { PickerModal } from './PickerModal';

const { colors, space, radius, typography } = lightTheme;

export interface TransactionFormValues {
  accountId: string;
  categoryId: string | null;
  amountCents: bigint;
  kind: 'expense' | 'income';
  description: string;
  notes: string;
  occurredAt: Date;
}

interface TransactionFormProps {
  initialValues?: Partial<TransactionFormValues>;
  submitLabel: string;
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const DATE_OPTIONS = ['Hoje', 'Ontem', 'Anteontem'];

function dateForOffset(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

type PickerKind = 'account' | 'category' | null;

export function TransactionForm({ initialValues, submitLabel, onSubmit, onDelete }: TransactionFormProps) {
  const [kind, setKind] = useState<'expense' | 'income'>(initialValues?.kind ?? 'expense');
  const [amountCents, setAmountCents] = useState<bigint>(initialValues?.amountCents ?? 0n);
  const [accountId, setAccountId] = useState<string | null>(initialValues?.accountId ?? null);
  const [categoryId, setCategoryId] = useState<string | null>(initialValues?.categoryId ?? null);
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [dateOffset, setDateOffset] = useState(0);
  const [openPicker, setOpenPicker] = useState<PickerKind>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: accountsData } = useAccounts();
  const { data: categoriesData } = useCategories(kind);

  const accounts = accountsData?.items ?? [];
  const categories = categoriesData?.items ?? [];

  const selectedAccount = accounts.find((a) => a.id === accountId);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  function selectKind(next: 'expense' | 'income') {
    // Categoria de saída não serve pra entrada e vice-versa.
    setKind(next);
    setCategoryId(null);
  }

  async function handleSubmit() {
    if (!accountId) {
      setError('Escolha uma conta.');
      return;
    }
    if (!description.trim()) {
      setError('Descreva o lançamento.');
      return;
    }
    if (amountCents <= 0n) {
      setError('Informe um valor.');
      return;
    }

    setError(null);
    setSubmitting(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await onSubmit({
        accountId,
        categoryId,
        amountCents,
        kind,
        description: description.trim(),
        notes: notes.trim(),
        occurredAt: dateForOffset(dateOffset),
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError('Não consegui salvar. Tenta de novo.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setSubmitting(true);
    try {
      await onDelete();
    } catch {
      setError('Não consegui excluir. Tenta de novo.');
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.kindToggle}>
        <Pressable
          style={[styles.kindButton, kind === 'expense' && styles.kindButtonActive]}
          onPress={() => selectKind('expense')}
          accessibilityRole="radio"
          accessibilityLabel="Saída"
          accessibilityState={{ selected: kind === 'expense' }}
        >
          <Text style={[styles.kindLabel, kind === 'expense' && styles.kindLabelActive]}>Saída</Text>
        </Pressable>
        <Pressable
          style={[styles.kindButton, kind === 'income' && styles.kindButtonActive]}
          onPress={() => selectKind('income')}
          accessibilityRole="radio"
          accessibilityLabel="Entrada"
          accessibilityState={{ selected: kind === 'income' }}
        >
          <Text style={[styles.kindLabel, kind === 'income' && styles.kindLabelActive]}>Entrada</Text>
        </Pressable>
      </View>

      <View style={styles.amountWrap}>
        <AmountInput
          valueCents={amountCents}
          onChangeCents={setAmountCents}
          tint={kind === 'income' ? colors.income : undefined}
          currencyPrefix
        />
      </View>

      <View style={styles.formCard}>
        <FormGroup>
          <FormRow
            label="Conta"
            value={selectedAccount?.name ?? 'Escolher'}
            onPress={() => setOpenPicker('account')}
          />
          <FormRow
            label="Categoria"
            value={selectedCategory?.name ?? 'Sem categoria'}
            color={selectedCategory?.color}
            onPress={() => setOpenPicker('category')}
          />
          <FormRow
            label="Data"
            value={DATE_OPTIONS[dateOffset]}
            onPress={() => setDateOffset((prev) => (prev + 1) % DATE_OPTIONS.length)}
          />
          <View style={styles.textRow}>
            <Text style={styles.textRowLabel}>Descrição</Text>
            <TextInput
              style={styles.textRowInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Ex.: Mercado"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={[styles.textRow, styles.textRowLast]}>
            <Text style={styles.textRowLabel}>Notas</Text>
            <TextInput
              style={styles.textRowInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Opcional"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </FormGroup>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Pressable
          style={styles.submitButton}
          onPress={() => void handleSubmit()}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel={submitLabel}
          accessibilityState={{ disabled: submitting, busy: submitting }}
        >
          {submitting ? (
            <ActivityIndicator color={colors.onBrand} />
          ) : (
            <Text style={styles.submitLabel}>{submitLabel}</Text>
          )}
        </Pressable>

        {onDelete ? (
          <Pressable
            style={styles.deleteButton}
            onPress={() => void handleDelete()}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Excluir lançamento"
          >
            <Text style={styles.deleteLabel}>Excluir lançamento</Text>
          </Pressable>
        ) : null}
      </View>

      <PickerModal
        visible={openPicker === 'account'}
        title="Conta"
        options={accounts.map((a) => ({ id: a.id, label: a.name }))}
        selectedId={accountId}
        onSelect={setAccountId}
        onClose={() => setOpenPicker(null)}
      />
      <PickerModal
        visible={openPicker === 'category'}
        title="Categoria"
        options={categories.map((c) => ({ id: c.id, label: c.name, color: c.color }))}
        selectedId={categoryId}
        onSelect={(id) => setCategoryId(id === categoryId ? null : id)}
        onClose={() => setOpenPicker(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: space.xl },
  kindToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
  },
  kindButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  kindButtonActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  kindLabel: { fontSize: typography.size.body, color: colors.textSecondary, fontWeight: typography.weight.medium },
  kindLabelActive: { color: colors.onBrand },
  amountWrap: { alignItems: 'center', paddingVertical: space.lg },
  formCard: { marginHorizontal: space.lg },
  error: {
    color: colors.danger,
    fontSize: typography.size.footnote,
    marginTop: space.sm,
    textAlign: 'center',
  },
  footer: { padding: space.lg },
  submitButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitLabel: { color: colors.onBrand, fontSize: typography.size.callout, fontWeight: typography.weight.medium },
  deleteButton: { marginTop: space.md, alignItems: 'center', paddingVertical: space.sm },
  deleteLabel: { color: colors.danger, fontSize: typography.size.body },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  textRowLast: { borderBottomWidth: 0 },
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
});
