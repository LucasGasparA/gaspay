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

/**
 * Só identificador visual — nome real do banco (sem problema, é uso
 * nominativo) mas cor genérica, não a cor de marca de cada banco. Nenhum
 * logo é reproduzido aqui (ver DDM-8). "Outro" cai na cor neutra padrão.
 */
const institutionOptions: { id: string; label: string; color: string | null }[] = [
  { id: 'nubank', label: 'Nubank', color: '#6B5FA8' },
  { id: 'itau', label: 'Itaú', color: '#D4863F' },
  { id: 'bradesco', label: 'Bradesco', color: '#C9506A' },
  { id: 'santander', label: 'Santander', color: '#D4453F' },
  { id: 'bb', label: 'Banco do Brasil', color: '#4477AA' },
  { id: 'caixa', label: 'Caixa', color: '#2E9E8F' },
  { id: 'inter', label: 'Inter', color: '#E0A23C' },
  { id: 'c6', label: 'C6 Bank', color: '#3D3D42' },
  { id: 'picpay', label: 'PicPay', color: '#5FA88B' },
  { id: 'other', label: 'Outro / Carteira', color: null },
];

type PickerKind = 'type' | 'institution' | null;

export default function NewAccount() {
  const router = useRouter();
  const createAccount = useCreateAccount();

  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [type, setType] = useState<AccountType>('checking');
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [initialBalanceCents, setInitialBalanceCents] = useState<bigint>(0n);
  const [openPicker, setOpenPicker] = useState<PickerKind>(null);
  const [error, setError] = useState<string | null>(null);

  const institution = institutionOptions.find((i) => i.id === institutionId);

  function selectInstitution(id: string) {
    setInstitutionId(id);
    // Só sugere o nome se a pessoa ainda não escreveu o dela — não pisa em cima.
    if (!nameTouched) {
      const chosen = institutionOptions.find((i) => i.id === id);
      if (chosen && chosen.id !== 'other') setName(chosen.label);
    }
  }

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
        color: institution?.color ?? null,
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
          <FormRow
            label="Instituição"
            value={institution?.label ?? 'Escolher'}
            color={institution?.color}
            onPress={() => setOpenPicker('institution')}
          />
          <View style={styles.textRow}>
            <Text style={styles.textRowLabel}>Nome</Text>
            <TextInput
              style={styles.textRowInput}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameTouched(true);
              }}
              placeholder="Ex.: Nubank"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <FormRow label="Tipo" value={accountTypeLabels[type]} onPress={() => setOpenPicker('type')} isLast />
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
        visible={openPicker === 'type'}
        title="Tipo de conta"
        options={typeOptions}
        selectedId={type}
        onSelect={(id) => setType(id as AccountType)}
        onClose={() => setOpenPicker(null)}
      />
      <PickerModal
        visible={openPicker === 'institution'}
        title="Instituição"
        options={institutionOptions}
        selectedId={institutionId}
        onSelect={selectInstitution}
        onClose={() => setOpenPicker(null)}
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
