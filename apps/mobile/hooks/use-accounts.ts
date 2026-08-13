import type { AccountDTO, AccountType } from '@dindim/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export const accountsKey = ['accounts'] as const;

interface AccountsResponse {
  items: AccountDTO[];
}

export function useAccounts() {
  return useQuery({
    queryKey: accountsKey,
    queryFn: () => apiFetch<AccountsResponse>('/api/accounts'),
  });
}

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  initialBalanceCents?: string;
  color?: string | null;
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAccountInput) =>
      apiFetch<AccountDTO>('/api/accounts', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountsKey });
    },
  });
}
