/**
 * Helpers de data. Tudo aqui trabalha no fuso local do dispositivo — o usuário
 * é um só e está sempre no mesmo fuso, então "hoje" é o hoje dele.
 *
 * `occurredAt` trafega como ISO 8601 com offset (`timestamptz` no Postgres).
 * `month` de orçamento e `deadline` de meta trafegam como `YYYY-MM-DD` puro.
 */

const MONTHS_LONG = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
] as const;

const MONTHS_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
] as const;

const WEEKDAYS = [
  'domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado',
] as const;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function at<T>(list: readonly T[], index: number): T {
  const value = list[index];
  if (value === undefined) throw new RangeError(`índice fora do intervalo: ${index}`);
  return value;
}

/** `Date` → `"YYYY-MM-DD"` no fuso local. */
export function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** `"YYYY-MM-DD"` → `Date` à meia-noite local (evita o off-by-one do UTC). */
export function fromDateOnly(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`data inválida: ${value}`);
  }
  return new Date(year, month - 1, day);
}

/** Chave estável de agrupamento do extrato por dia. */
export function dayKey(date: Date): string {
  return toDateOnly(date);
}

/** Primeiro dia do mês, no formato que a coluna `budgets.month` espera. */
export function monthStart(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-01`;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateOnly(a) === toDateOnly(b);
}

/** `"Hoje"`, `"Ontem"`, `"quinta, 12 de agosto"`. Cabeçalho de grupo do extrato. */
export function formatDayLabel(date: Date, now: Date = new Date()): string {
  if (isSameDay(date, now)) return 'Hoje';

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Ontem';

  const weekday = at(WEEKDAYS, date.getDay());
  const month = at(MONTHS_LONG, date.getMonth());
  const base = `${weekday}, ${date.getDate()} de ${month}`;

  return date.getFullYear() === now.getFullYear() ? base : `${base} de ${date.getFullYear()}`;
}

/** `"12 ago"` — linha de transação compacta. */
export function formatDayShort(date: Date): string {
  return `${date.getDate()} ${at(MONTHS_SHORT, date.getMonth())}`;
}

/** `"agosto de 2026"` — cabeçalho de mês. */
export function formatMonthLabel(date: Date): string {
  return `${at(MONTHS_LONG, date.getMonth())} de ${date.getFullYear()}`;
}

/** `"Agosto"` — chip de seletor de mês. */
export function formatMonthShort(date: Date): string {
  const month = at(MONTHS_LONG, date.getMonth());
  return month.charAt(0).toUpperCase() + month.slice(1);
}

/** Quantos dias faltam para o mês acabar, contando hoje. Usado na projeção. */
export function daysLeftInMonth(now: Date = new Date()): number {
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return last - now.getDate() + 1;
}
