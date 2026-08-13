import { lightTheme } from '@dindim/shared';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const { colors, space, radius, typography } = lightTheme;

export interface PickerOption {
  id: string;
  label: string;
  color?: string | null;
}

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function PickerModal({ visible, title, options, selectedId, onSelect, onClose }: PickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {options.length === 0 ? <Text style={styles.empty}>Nada por aqui ainda.</Text> : null}
          {options.map((option) => {
            const selected = option.id === selectedId;
            return (
              <Pressable
                key={option.id}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => {
                  onSelect(option.id);
                  onClose();
                }}
              >
                {option.color ? <View style={[styles.dot, { backgroundColor: option.color }]} /> : null}
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable style={styles.cancelButton} onPress={onClose}>
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
    paddingTop: space.md,
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
    maxHeight: '70%',
  },
  title: {
    fontSize: typography.size.title,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    marginBottom: space.sm,
  },
  list: { flexGrow: 0 },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
  optionSelected: {},
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  optionLabel: { fontSize: typography.size.body, color: colors.text },
  empty: { fontSize: typography.size.body, color: colors.textTertiary, paddingVertical: space.sm },
  cancelButton: { marginTop: space.sm, alignItems: 'center', paddingVertical: space.sm },
  cancelLabel: { color: colors.textSecondary, fontSize: typography.size.body },
});
