import { lightTheme } from '@dindim/shared';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoryForm, type CategoryFormValues } from '../../components/CategoryForm';
import { useCreateCategory } from '../../hooks/use-categories';

const { colors, space, typography } = lightTheme;

export default function NewCategory() {
  const router = useRouter();
  const createCategory = useCreateCategory();

  async function handleSubmit(values: CategoryFormValues) {
    await createCategory.mutateAsync(values);
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nova categoria</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeLabel}>✕</Text>
        </Pressable>
      </View>
      <CategoryForm submitLabel="Criar categoria" onSubmit={handleSubmit} />
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
});
