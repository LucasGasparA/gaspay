import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';

export interface Me {
  user: { id: string; name: string; email: string; image: string | null };
  session: { expiresAt: string };
}

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => apiFetch<Me>('/api/me') });
}
