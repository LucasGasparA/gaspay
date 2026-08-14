import { lightTheme } from '@dindim/shared';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { authClient } from '../lib/auth-client';

const { colors, space, radius, typography } = lightTheme;

interface PhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Sem infraestrutura de upload (sem S3/R2/Cloudinary configurado) — a foto
 * vai como data URI base64 direto na coluna `image` (texto, sem limite
 * prático de tamanho no Postgres). Recorte quadrado + qualidade 0.5 mantêm o
 * payload pequeno o bastante pra isso ser razoável num app de um usuário só.
 * Se um dia precisar servir a foto fora do app (link público, etc.), aí sim
 * vale migrar pra um provedor de storage de verdade.
 */
export function PhotoPickerModal({ visible, onClose }: PhotoPickerModalProps) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResult(result: ImagePicker.ImagePickerResult) {
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset?.base64) {
      setError('Não consegui ler a imagem. Tenta de novo.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await authClient.updateUser({ image: `data:image/jpeg;base64,${asset.base64}` });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      onClose();
    } catch {
      setError('Não consegui salvar a foto. Tenta de novo.');
    } finally {
      setUploading(false);
    }
  }

  async function handleCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Sem permissão pra usar a câmera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
      mediaTypes: 'images',
    });
    await handleResult(result);
  }

  async function handleLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Sem permissão pra acessar suas fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
      mediaTypes: 'images',
    });
    await handleResult(result);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Foto do perfil</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {uploading ? (
          <ActivityIndicator color={colors.brand} style={styles.spinner} />
        ) : (
          <View style={styles.options}>
            <Pressable
              style={styles.option}
              onPress={() => void handleCamera()}
              accessibilityRole="button"
              accessibilityLabel="Tirar foto"
            >
              <Text style={styles.optionLabel}>Tirar foto</Text>
            </Pressable>
            <Pressable
              style={styles.option}
              onPress={() => void handleLibrary()}
              accessibilityRole="button"
              accessibilityLabel="Escolher da galeria"
            >
              <Text style={styles.optionLabel}>Escolher da galeria</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.cancelButton} onPress={onClose} disabled={uploading}>
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
  },
  title: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    marginBottom: space.md,
  },
  error: { fontSize: typography.size.footnote, color: colors.danger, marginBottom: space.sm },
  spinner: { paddingVertical: space.lg },
  options: { gap: space.sm },
  option: {
    paddingVertical: space.md,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  optionLabel: { fontSize: typography.size.body, fontWeight: typography.weight.medium, color: colors.text },
  cancelButton: { marginTop: space.sm, alignItems: 'center', paddingVertical: space.sm },
  cancelLabel: { color: colors.textSecondary, fontSize: typography.size.body },
});
