import type { TransactionDTO } from '@dindim/shared';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { accountsKey } from './use-accounts';

export const transactionsKey = ['transactions'] as const;

interface TransactionsPage {
  items: TransactionDTO[];
  nextCursor: string | null;
}

export interface TransactionsFilter {
  kind?: 'expense' | 'income';
  search?: string;
}

export function useTransactions(filter: TransactionsFilter = {}) {
  const { kind, search } = filter;

  return useInfiniteQuery({
    queryKey: [...transactionsKey, kind ?? 'all', search ?? ''] as const,
    queryFn: ({ pageParam }: { pageParam: string | null }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set('cursor', pageParam);
      if (kind) params.set('kind', kind);
      if (search) params.set('search', search);
      const query = params.toString();
      return apiFetch<TransactionsPage>(`/api/transactions${query ? `?${query}` : ''}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

/** Últimos N lançamentos — usado no resumo da Home, sem paginação. */
export function useRecentTransactions(limit: number) {
  return useQuery({
    queryKey: [...transactionsKey, 'recent', limit] as const,
    queryFn: () => apiFetch<TransactionsPage>(`/api/transactions?limit=${limit}`),
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => apiFetch<TransactionDTO>(`/api/transactions/${id}`),
    enabled: Boolean(id),
  });
}

export interface TransactionInput {
  accountId: string;
  categoryId?: string | null;
  amountCents: string;
  kind: 'expense' | 'income';
  occurredAt: string;
  description: string;
  notes?: string | null;
}

/** Lançamento muda saldo de conta — toda mutação invalida as duas listas. */
function invalidateTransactionEffects(queryClient: ReturnType<typeof useQueryClient>): void {
  void queryClient.invalidateQueries({ queryKey: transactionsKey });
  void queryClient.invalidateQueries({ queryKey: accountsKey });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TransactionInput) =>
      apiFetch<TransactionDTO>('/api/transactions', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => invalidateTransactionEffects(queryClient),
  });
}

export function useUpdateTransaction(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<TransactionInput>) =>
      apiFetch<TransactionDTO>(`/api/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => invalidateTransactionEffects(queryClient),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidateTransactionEffects(queryClient),
  });
}
