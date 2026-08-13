import type { GoalDTO } from '@dindim/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

const goalsKey = ['goals'] as const;

interface GoalsResponse {
  items: GoalDTO[];
}

export function useGoals() {
  return useQuery({ queryKey: goalsKey, queryFn: () => apiFetch<GoalsResponse>('/api/goals') });
}

export interface CreateGoalInput {
  name: string;
  targetCents: string;
  savedCents?: string;
  deadline?: string | null;
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateGoalInput) =>
      apiFetch<GoalDTO>('/api/goals', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: goalsKey }),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/api/goals/${id}`, { method: 'DELETE' }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: goalsKey }),
  });
}
