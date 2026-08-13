import { lightTheme } from '@dindim/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AmountInput } from '../../components/AmountInput';
import { useCreateGoal } from '../../hooks/use-goals';

const { colors, space, radius, typography } = lightTheme;

const DEADLINE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default function NewGoal() {
  const router = useRouter();
  const createGoal = useCreateGoal();

  const [name, setName] = useState('');
  const [targetCents, setTargetCents] = useState<bigint>(0n);
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Dê um nome à meta.');
      return;
    }
    if (targetCents <= 0n) {
      setError('Informe quanto você quer juntar.');
      return;
    }
    if (deadline && !DEADLINE_PATTERN.test(deadline)) {
      setError('Prazo precisa ser no formato AAAA-MM-DD.');
      return;
    }

    setError(null);
    try {
      await createGoal.mutateAsync({
        name: name.trim(),
        targetCents: targetCents.toString(),
        deadline: deadline || null,
      });
      router.back();
    } catch {
      setError('Não consegui criar a meta. Tenta de novo.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nova meta</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeLabel}>✕</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.amountWrap}>
          <AmountInput valueCents={targetCents} onChangeCents={setTargetCents} />
          <Text style={styles.amountLabel}>Quanto você quer juntar</Text>
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Viagem para o Chile"
          placeholderTextColor={colors.textTertiary}
        />

        <Text style={styles.label}>Prazo (opcional)</Text>
        <TextInput
          style={styles.textInput}
          value={deadline}
          onChangeText={setDeadline}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={colors.textTertiary}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.submitButton} onPress={() => void handleSubmit()} disabled={createGoal.isPending}>
          {createGoal.isPending ? (
            <ActivityIndicator color={colors.onBrand} />
          ) : (
            <Text style={styles.submitLabel}>Criar meta</Text>
          )}
        </Pressable>
      </ScrollView>
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
  label: {
    fontSize: typography.size.footnote,
    color: colors.textSecondary,
    marginTop: space.md,
    marginBottom: space.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: typography.size.body,
    color: colors.text,
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
