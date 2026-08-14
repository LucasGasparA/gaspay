import type { CategoryDTO, CategoryKind } from '@dindim/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export const categoriesKey = ['categories'] as const;

interface CategoriesResponse {
  items: CategoryDTO[];
}

export function useCategories(kind?: CategoryKind) {
  return useQuery({
    queryKey: [...categoriesKey, kind ?? 'all'],
    queryFn: () =>
      apiFetch<CategoriesResponse>(`/api/categories${kind ? `?kind=${kind}` : ''}`),
  });
}

export interface CategoryInput {
  name: string;
  icon: string;
  color: string;
  kind: CategoryKind;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) =>
      apiFetch<CategoryDTO>('/api/categories', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: categoriesKey }),
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<CategoryInput>) =>
      apiFetch<CategoryDTO>(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: categoriesKey }),
  });
}
