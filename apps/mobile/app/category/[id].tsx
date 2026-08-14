import { lightTheme } from '@dindim/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoryForm, type CategoryFormValues } from '../../components/CategoryForm';
import { useCategories, useUpdateCategory } from '../../hooks/use-categories';

const { colors, space, typography } = lightTheme;

/**
 * Não existe `GET /api/categories/:id` — a lista inteira já vem sem paginação,
 * então a categoria editada é achada no cache de `useCategories()`.
 */
export default function EditCategory() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const { data, isLoading } = useCategories();
  const category = data?.items.find((item) => item.id === id);
  const updateCategory = useUpdateCategory(id ?? '');

  async function handleSubmit(values: CategoryFormValues) {
    await updateCategory.mutateAsync(values);
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categoria</Text>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeLabel}>✕</Text>
        </Pressable>
      </View>

      {isLoading || !category ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: space.xl }} />
      ) : (
        <CategoryForm
          submitLabel="Salvar alterações"
          initialValues={{ name: category.name, icon: category.icon, color: category.color, kind: category.kind }}
          onSubmit={handleSubmit}
        />
      )}
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
