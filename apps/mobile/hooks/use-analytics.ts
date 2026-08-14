import { monthStart, type CategorySpendDTO, type MonthlyFlowDTO } from '@dindim/shared';
import { useQuery } from '@tanstack/react-query';
import type { FlowChartPoint } from '../components/FlowChart';
import { apiFetch } from '../lib/api';

export function useCategorySpend(month: string) {
  return useQuery({
    queryKey: ['analytics', 'category-spend', month],
    queryFn: () => apiFetch<CategorySpendDTO>(`/api/analytics/category-spend?month=${month}`),
  });
}

const MONTH_ABBR = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/**
 * A API só devolve meses com lançamento — meses vazios completam aqui com
 * zero, senão o gráfico perderia uma barra sempre que um mês ficasse sem
 * nenhum registro.
 */
export function useMonthlyFlow(months = 6) {
  const anchorMonth = monthStart(new Date());

  return useQuery({
    queryKey: ['analytics', 'monthly-flow', anchorMonth, months],
    queryFn: async (): Promise<FlowChartPoint[]> => {
      const data = await apiFetch<MonthlyFlowDTO>(
        `/api/analytics/monthly-flow?anchorMonth=${anchorMonth}&months=${months}`,
      );
      const byMonth = new Map(data.points.map((point) => [point.month.slice(0, 7), point]));
      const anchor = new Date(anchorMonth);

      const result: FlowChartPoint[] = [];
      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const found = byMonth.get(key);
        result.push({
          month: MONTH_ABBR[date.getMonth()] ?? '',
          incomeCents: found ? Number(found.incomeCents) : 0,
          expenseCents: found ? Number(found.expenseCents) : 0,
        });
      }
      return result;
    },
  });
}

export interface CurrentMonthFlow {
  incomeCents: bigint;
  expenseCents: bigint;
}

/**
 * Entradas/saídas só do mês corrente, do mesmo `/monthly-flow` que já
 * alimenta o gráfico "Últimos 6 meses" — soma no Postgres, sem o limite de
 * 100 lançamentos que o antigo `useMonthSummary` (client-side, removido)
 * tinha. `FlowChartPoint` já converteu os centavos pra `number`; a Home
 * precisa de `bigint` pra `formatCents`, então converte de volta aqui.
 */
export function useCurrentMonthFlow() {
  const query = useMonthlyFlow(1);
  const point = query.data?.[0];

  return {
    ...query,
    data: point
      ? { incomeCents: BigInt(Math.round(point.incomeCents)), expenseCents: BigInt(Math.round(point.expenseCents)) }
      : undefined,
  };
}
