import type { BudgetDTO } from '@dindim/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

interface BudgetsResponse {
  items: BudgetDTO[];
}

export function budgetsKey(month: string) {
  return ['budgets', month] as const;
}

export function useBudgets(month: string) {
  return useQuery({
    queryKey: budgetsKey(month),
    queryFn: () => apiFetch<BudgetsResponse>(`/api/budgets?month=${month}`),
  });
}

export interface UpsertBudgetInput {
  categoryId: string;
  month: string;
  limitCents: string;
}

/** `(categoria, mês)` é único no banco — isso é sempre criar ou atualizar, nunca duplicar. */
export function useUpsertBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertBudgetInput) =>
      apiFetch<BudgetDTO>('/api/budgets', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (_, input) => {
      void queryClient.invalidateQueries({ queryKey: budgetsKey(input.month) });
    },
  });
}

export function useDeleteBudget(month: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/budgets/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: budgetsKey(month) });
    },
  });
}
