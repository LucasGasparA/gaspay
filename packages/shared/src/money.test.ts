import { describe, expect, it } from 'vitest';
import {
  digitsToCents,
  formatCents,
  formatCentsParts,
  parseCents,
  percentOfCents,
  signedCents,
  sumCents,
} from './money.js';

describe('formatCents', () => {
  it('formata em pt-BR com separador de milhar', () => {
    expect(formatCents(124050n)).toBe('R$ 1.240,50');
    expect(formatCents(0n)).toBe('R$ 0,00');
    expect(formatCents(5n)).toBe('R$ 0,05');
    expect(formatCents(100000000n)).toBe('R$ 1.000.000,00');
  });

  it('leva o sinal para fora do símbolo da moeda', () => {
    expect(formatCents(-124050n)).toBe('-R$ 1.240,50');
    expect(formatCents(124050n, { signDisplay: 'always' })).toBe('+R$ 1.240,50');
    expect(formatCents(-124050n, { signDisplay: 'never' })).toBe('R$ 1.240,50');
  });

  it('omite os centavos quando pedido e o valor é redondo', () => {
    expect(formatCents(124000n, { omitZeroFraction: true })).toBe('R$ 1.240');
    expect(formatCents(124050n, { omitZeroFraction: true })).toBe('R$ 1.240,50');
  });

  it('separa as partes para renderização', () => {
    expect(formatCentsParts(-124050n)).toEqual({
      sign: '-',
      currency: 'R$',
      whole: '1.240',
      fraction: '50',
    });
  });
});

describe('parseCents', () => {
  it('aceita os formatos que um humano digita', () => {
    expect(parseCents('1.234,56')).toBe(123456n);
    expect(parseCents('1234,56')).toBe(123456n);
    expect(parseCents('1234.56')).toBe(123456n);
    expect(parseCents('R$ 1.234,56')).toBe(123456n);
    expect(parseCents('1234')).toBe(123400n);
    expect(parseCents('0,05')).toBe(5n);
    expect(parseCents(',5')).toBe(50n);
  });

  it('trata ponto de milhar como milhar, não como decimal', () => {
    expect(parseCents('1.234')).toBe(123400n);
    expect(parseCents('1.234.567')).toBe(123456700n);
  });

  it('preserva o sinal', () => {
    expect(parseCents('-1.234,56')).toBe(-123456n);
  });

  it('rejeita entrada sem número', () => {
    expect(() => parseCents('')).toThrow();
    expect(() => parseCents('abc')).toThrow();
  });

  it('faz round-trip com formatCents', () => {
    for (const cents of [0n, 5n, 99n, 100n, 123456n, -987654321n]) {
      expect(parseCents(formatCents(cents))).toBe(cents);
    }
  });
});

describe('digitsToCents', () => {
  it('empurra os dígitos pela direita, como o teclado do app', () => {
    expect(digitsToCents('')).toBe(0n);
    expect(digitsToCents('1')).toBe(1n);
    expect(digitsToCents('1250')).toBe(1250n);
    expect(digitsToCents('00012')).toBe(12n);
  });
});

describe('regras de domínio', () => {
  it('deriva o sinal do kind, nunca do valor armazenado', () => {
    expect(signedCents('income', 5000n)).toBe(5000n);
    expect(signedCents('expense', 5000n)).toBe(-5000n);
    expect(signedCents('transfer', 5000n)).toBe(-5000n);
    // valor no banco é sempre positivo, mas se vier sujo o sinal ainda manda
    expect(signedCents('income', -5000n)).toBe(5000n);
  });

  it('soma sem perder precisão em valores grandes', () => {
    const values = Array.from({ length: 10_000 }, () => 1n);
    expect(sumCents(values)).toBe(10_000n);
    expect(sumCents([9_007_199_254_740_993n, 1n])).toBe(9_007_199_254_740_994n);
  });

  it('calcula percentual com 2 casas', () => {
    expect(percentOfCents(5000n, 10000n)).toBe(50);
    expect(percentOfCents(1n, 3n)).toBe(33.33);
    expect(percentOfCents(1n, 0n)).toBe(0);
  });
});
