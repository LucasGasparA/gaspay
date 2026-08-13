import type { CategoryDTO, CategoryKind } from '@dindim/shared';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

interface CategoriesResponse {
  items: CategoryDTO[];
}

export function useCategories(kind?: CategoryKind) {
  return useQuery({
    queryKey: ['categories', kind ?? 'all'],
    queryFn: () =>
      apiFetch<CategoriesResponse>(`/api/categories${kind ? `?kind=${kind}` : ''}`),
  });
}
