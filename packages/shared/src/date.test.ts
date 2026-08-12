import { describe, expect, it } from 'vitest';
import {
  daysLeftInMonth,
  endOfMonth,
  formatDayLabel,
  formatDayShort,
  formatMonthLabel,
  fromDateOnly,
  monthStart,
  startOfMonth,
  toDateOnly,
} from './date.js';

describe('conversão de data', () => {
  it('usa o fuso local, não UTC', () => {
    const date = new Date(2026, 7, 12, 23, 30);
    expect(toDateOnly(date)).toBe('2026-08-12');
  });

  it('faz round-trip sem off-by-one', () => {
    expect(toDateOnly(fromDateOnly('2026-01-01'))).toBe('2026-01-01');
    expect(toDateOnly(fromDateOnly('2026-12-31'))).toBe('2026-12-31');
  });

  it('normaliza o mês para o dia 1', () => {
    expect(monthStart(new Date(2026, 7, 31))).toBe('2026-08-01');
    expect(toDateOnly(startOfMonth(new Date(2026, 7, 31)))).toBe('2026-08-01');
    expect(toDateOnly(endOfMonth(new Date(2026, 7, 1)))).toBe('2026-08-31');
    expect(toDateOnly(endOfMonth(new Date(2024, 1, 1)))).toBe('2024-02-29');
  });
});

describe('rótulos', () => {
  const now = new Date(2026, 7, 12, 10, 0);

  it('nomeia hoje e ontem em vez de mostrar a data', () => {
    expect(formatDayLabel(new Date(2026, 7, 12, 22, 0), now)).toBe('Hoje');
    expect(formatDayLabel(new Date(2026, 7, 11, 1, 0), now)).toBe('Ontem');
  });

  it('mostra dia da semana no mesmo ano e inclui o ano fora dele', () => {
    expect(formatDayLabel(new Date(2026, 7, 5), now)).toBe('quarta, 5 de agosto');
    expect(formatDayLabel(new Date(2025, 7, 5), now)).toBe('terça, 5 de agosto de 2025');
  });

  it('formata rótulos curtos', () => {
    expect(formatDayShort(new Date(2026, 7, 12))).toBe('12 ago');
    expect(formatMonthLabel(new Date(2026, 7, 12))).toBe('agosto de 2026');
  });
});

describe('daysLeftInMonth', () => {
  it('conta o dia de hoje', () => {
    expect(daysLeftInMonth(new Date(2026, 7, 31))).toBe(1);
    expect(daysLeftInMonth(new Date(2026, 7, 1))).toBe(31);
  });
});
