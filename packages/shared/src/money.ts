/**
 * Dinheiro é sempre `bigint` em centavos. Nunca float.
 *
 * Nenhuma função deste módulo usa `Intl`: o Hermes no Android tem suporte
 * parcial a `Intl` e `Intl.NumberFormat#format` não aceita `bigint` de forma
 * confiável. A formatação pt-BR é feita na mão e é exata.
 */

/** Centavos. Sempre inteiro, sempre `bigint`. */
export type Cents = bigint;

const GROUP_SEPARATOR = '.';
const DECIMAL_SEPARATOR = ',';
const CURRENCY = 'R$';

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR);
}

function splitCents(cents: Cents): { negative: boolean; whole: string; fraction: string } {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  return {
    negative,
    whole: (abs / 100n).toString(),
    fraction: (abs % 100n).toString().padStart(2, '0'),
  };
}

export interface FormatCentsOptions {
  /** Inclui o prefixo `R$`. Default `true`. */
  currency?: boolean;
  /** Omite `,00` quando o valor é redondo. Default `false`. */
  omitZeroFraction?: boolean;
  /** Força `+` em valores positivos. Default `false`. */
  signDisplay?: 'auto' | 'always' | 'never';
}

/** `124050n` → `"R$ 1.240,50"` */
export function formatCents(cents: Cents, options: FormatCentsOptions = {}): string {
  const { currency = true, omitZeroFraction = false, signDisplay = 'auto' } = options;
  const { negative, whole, fraction } = splitCents(cents);

  let out = groupThousands(whole);
  if (!(omitZeroFraction && fraction === '00')) {
    out += DECIMAL_SEPARATOR + fraction;
  }
  if (currency) out = `${CURRENCY} ${out}`;

  if (negative && signDisplay !== 'never') out = `-${out}`;
  else if (!negative && signDisplay === 'always' && cents !== 0n) out = `+${out}`;

  return out;
}

/**
 * Devolve as partes do valor separadas, para renderizar os centavos menores
 * que a parte inteira (o padrão visual do app).
 */
export function formatCentsParts(cents: Cents): {
  sign: '' | '-';
  currency: string;
  whole: string;
  fraction: string;
} {
  const { negative, whole, fraction } = splitCents(cents);
  return {
    sign: negative ? '-' : '',
    currency: CURRENCY,
    whole: groupThousands(whole),
    fraction,
  };
}

/** `124050n` → `"1240.50"`. Usado só em export CSV / debug — nunca em cálculo. */
export function centsToDecimalString(cents: Cents): string {
  const { negative, whole, fraction } = splitCents(cents);
  return `${negative ? '-' : ''}${whole}.${fraction}`;
}

/**
 * Interpreta texto digitado por humano em centavos.
 * Aceita `"1.234,56"`, `"1234,56"`, `"1234.56"`, `"1234"`, `"R$ 1.234,56"`.
 * Lança se a entrada não for reconhecível.
 */
export function parseCents(input: string): Cents {
  const raw = input.trim();
  if (raw === '') throw new Error('valor vazio');

  const negative = /^-/.test(raw) || /^\(.*\)$/.test(raw);
  const cleaned = raw.replace(/[^\d.,]/g, '');
  if (cleaned === '') throw new Error(`valor inválido: ${input}`);

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  const decimalAt = Math.max(lastComma, lastDot);

  let wholePart: string;
  let fractionPart: string;

  // Só é separador decimal se sobrarem no máximo 2 dígitos depois dele.
  // "1.234" é mil duzentos e trinta e quatro; "1.23" é um e vinte e três.
  const tail = decimalAt === -1 ? '' : cleaned.slice(decimalAt + 1);
  if (decimalAt !== -1 && tail.length > 0 && tail.length <= 2 && !/[.,]/.test(tail)) {
    wholePart = cleaned.slice(0, decimalAt).replace(/[.,]/g, '');
    fractionPart = tail.padEnd(2, '0');
  } else {
    wholePart = cleaned.replace(/[.,]/g, '');
    fractionPart = '00';
  }

  if (wholePart === '') wholePart = '0';
  if (!/^\d+$/.test(wholePart) || !/^\d{2}$/.test(fractionPart)) {
    throw new Error(`valor inválido: ${input}`);
  }

  const cents = BigInt(wholePart) * 100n + BigInt(fractionPart);
  return negative ? -cents : cents;
}

/**
 * Teclado numérico do app: o usuário digita dígitos e eles entram pela direita.
 * `"1"` → `1n` (R$ 0,01), `"1250"` → `1250n` (R$ 12,50).
 */
export function digitsToCents(digits: string): Cents {
  const onlyDigits = digits.replace(/\D/g, '').slice(0, 15);
  if (onlyDigits === '') return 0n;
  return BigInt(onlyDigits);
}

export function sumCents(values: Iterable<Cents>): Cents {
  let total = 0n;
  for (const value of values) total += value;
  return total;
}

export function absCents(cents: Cents): Cents {
  return cents < 0n ? -cents : cents;
}

/**
 * `amountCents` no banco é sempre positivo — o sinal vem do `kind`.
 * Esta função aplica o sinal para exibição e para somatórios de saldo.
 */
export function signedCents(kind: 'expense' | 'income' | 'transfer', amountCents: Cents): Cents {
  const abs = absCents(amountCents);
  return kind === 'income' ? abs : -abs;
}

/**
 * Percentual de `part` sobre `total` com 2 casas, calculado em `bigint` e só
 * convertido para `number` no fim (é razão, não dinheiro).
 */
export function percentOfCents(part: Cents, total: Cents): number {
  if (total === 0n) return 0;
  return Number((absCents(part) * 10000n) / absCents(total)) / 100;
}
