import { lightTheme } from '@dindim/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { authClient } from '../lib/auth-client';

const { colors, space, radius, typography } = lightTheme;

interface EditNameModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
}

/**
 * `name` é o único campo de perfil que existe de verdade pra editar — email
 * vem do Google, e CPF/telefone não têm coluna nenhuma no banco (ver DDM-6).
 * `authClient.updateUser` é o endpoint `/update-user` que o Better Auth já
 * expõe de fábrica, não precisou de rota nova na API.
 */
export function EditNameModal({ visible, currentName, onClose }: EditNameModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setError(null);
    }
  }, [visible, currentName]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('O nome não pode ficar em branco.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await authClient.updateUser({ name: trimmed });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      onClose();
    } catch {
      setError('Não consegui salvar. Tenta de novo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Editar nome</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Seu nome"
          placeholderTextColor={colors.textTertiary}
          autoFocus
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={styles.saveButton}
          onPress={() => void handleSave()}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Salvar nome"
        >
          {saving ? <ActivityIndicator color={colors.onBrand} /> : <Text style={styles.saveLabel}>Salvar</Text>}
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={onClose} disabled={saving}>
          <Text style={styles.cancelLabel}>Cancelar</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: space.lg,
    gap: space.md,
  },
  title: { fontSize: typography.size.title, fontWeight: typography.weight.semibold, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: typography.size.body,
    color: colors.text,
  },
  error: { fontSize: typography.size.footnote, color: colors.danger },
  saveButton: {
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  saveLabel: { color: colors.onBrand, fontSize: typography.size.callout, fontWeight: typography.weight.medium },
  cancelButton: { alignItems: 'center', paddingVertical: space.sm },
  cancelLabel: { color: colors.textSecondary, fontSize: typography.size.body },
});
