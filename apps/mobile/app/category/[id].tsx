import { lightTheme } from '@dindim/shared';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CategoryForm, type CategoryFormValues } from '../../components/CategoryForm';
import { useCategories, useDeleteCategory, useUpdateCategory } from '../../hooks/use-categories';
import { ApiError } from '../../lib/api';

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
  const deleteCategory = useDeleteCategory();

  async function handleSubmit(values: CategoryFormValues) {
    await updateCategory.mutateAsync(values);
    router.back();
  }

  /**
   * A API recusa com 409 se a categoria já tem lançamento — pede confirmação
   * explícita via `?force=true` (ver `apps/api/src/routes/categories.ts`).
   * Os lançamentos ficam sem categoria, não são apagados.
   */
  async function handleDelete() {
    if (!id) return;
    try {
      await deleteCategory.mutateAsync({ id });
      router.back();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        Alert.alert(
          'Categoria em uso',
          'Essa categoria já tem lançamentos. Excluir mesmo assim? Os lançamentos ficam sem categoria, mas não são apagados.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Excluir mesmo assim',
              style: 'destructive',
              onPress: () => {
                void deleteCategory.mutateAsync({ id, force: true }).then(() => router.back());
              },
            },
          ],
        );
        return;
      }
      throw err;
    }
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
          onDelete={handleDelete}
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
