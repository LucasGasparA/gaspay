import { accentPalette, lightTheme, type CategoryKind } from '@dindim/shared';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { FormGroup } from './FormGroup';
import { FormRow } from './FormRow';
import { PickerModal } from './PickerModal';

const { colors, space, radius, typography } = lightTheme;

/** Sem seletor de ícone na UI ainda — toda categoria nova/editada por aqui usa esse genérico. */
const DEFAULT_ICON = 'circle-ellipsis';

export interface CategoryFormValues {
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
}

interface CategoryFormProps {
  initialValues?: Partial<CategoryFormValues>;
  submitLabel: string;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function CategoryForm({ initialValues, submitLabel, onSubmit, onDelete }: CategoryFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [kind, setKind] = useState<CategoryKind>(initialValues?.kind ?? 'expense');
  const [color, setColor] = useState(initialValues?.color ?? accentPalette[0]);
  const [openColorPicker, setOpenColorPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim()) {
      setError('Dê um nome à categoria.');
      return;
    }

    setError(null);
    setSubmitting(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await onSubmit({
        name: name.trim(),
        icon: initialValues?.icon ?? DEFAULT_ICON,
        color,
        kind,
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
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.kindToggle}>
        <Pressable
          style={[styles.kindButton, kind === 'expense' && styles.kindButtonActive]}
          onPress={() => setKind('expense')}
          accessibilityRole="radio"
          accessibilityLabel="Despesa"
          accessibilityState={{ selected: kind === 'expense' }}
        >
          <Text style={[styles.kindLabel, kind === 'expense' && styles.kindLabelActive]}>Despesa</Text>
        </Pressable>
        <Pressable
          style={[styles.kindButton, kind === 'income' && styles.kindButtonActive]}
          onPress={() => setKind('income')}
          accessibilityRole="radio"
          accessibilityLabel="Receita"
          accessibilityState={{ selected: kind === 'income' }}
        >
          <Text style={[styles.kindLabel, kind === 'income' && styles.kindLabelActive]}>Receita</Text>
        </Pressable>
      </View>

      <FormGroup>
        <View style={styles.textRow}>
          <Text style={styles.textRowLabel}>Nome</Text>
          <TextInput
            style={styles.textRowInput}
            value={name}
            onChangeText={setName}
            placeholder="Ex.: Assinaturas"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <FormRow label="Cor" value={color} color={color} onPress={() => setOpenColorPicker(true)} isLast />
      </FormGroup>

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
          accessibilityLabel="Excluir categoria"
        >
          <Text style={styles.deleteLabel}>Excluir categoria</Text>
        </Pressable>
      ) : null}

      <PickerModal
        visible={openColorPicker}
        title="Cor"
        options={accentPalette.map((hex) => ({ id: hex, label: hex, color: hex }))}
        selectedId={color}
        onSelect={setColor}
        onClose={() => setOpenColorPicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, paddingBottom: space.xl * 2 },
  kindToggle: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, paddingBottom: space.lg },
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
  deleteButton: { marginTop: space.md, alignItems: 'center', paddingVertical: space.sm },
  deleteLabel: { color: colors.danger, fontSize: typography.size.body },
});
