import { neutral, purple, semantic } from './palette.js';

export const radius = { sm: 8, md: 16, lg: 24, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

/**
 * Padding lateral padrão de tela. O plano pede espaço em branco agressivo:
 * nada encosta na borda, nunca.
 */
export const screenPadding = space.lg;

export const typography = {
  family: {
    regular: 'InterTight_400Regular',
    medium: 'InterTight_500Medium',
    semibold: 'InterTight_600SemiBold',
  },
  /**
   * Tipografia é a hierarquia — não há borda separando seção, o peso e o
   * tamanho fazem isso.
   */
  size: {
    caption: 12,
    footnote: 13,
    body: 15,
    callout: 17,
    title: 20,
    heading: 24,
    display: 32,
    hero: 40,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.35,
    relaxed: 1.5,
  },
} as const;

/** Todo valor monetário leva isto, senão o número "dança" ao animar. */
export const tabularNums = ['tabular-nums'] as const;

/** Movimento por spring, nunca easing linear. */
export const spring = { damping: 18, stiffness: 220, mass: 0.6 } as const;

export const springSoft = { damping: 22, stiffness: 140, mass: 0.8 } as const;

export const duration = { fast: 140, base: 220, slow: 320 } as const;

export const lightTheme = {
  colors: {
    // O roxo ocupa ~15% da tela: header, FAB, estado ativo, barra de progresso.
    brand: purple[500],
    brandPressed: purple[600],
    brandSubtle: purple[50],
    onBrand: neutral[0],

    background: neutral[50],
    surface: neutral[0],
    surfaceSunken: neutral[50],
    border: neutral[100],
    divider: neutral[100],

    text: neutral[900],
    textSecondary: neutral[500],
    textTertiary: neutral[300],
    onSurfaceInverted: neutral[0],

    // Despesa NÃO é vermelha: sai como texto normal. Só entrada ganha cor.
    income: semantic.positive,
    expense: neutral[900],
    danger: semantic.negative,
    warning: semantic.warning,

    skeleton: neutral[100],
    scrim: 'rgba(25,25,25,0.45)',
  },
  radius,
  space,
  typography,
  spring,
  duration,
} as const;

/**
 * Modo escuro só entra depois da Fase 3, mas os tokens já ficam prontos:
 * `#820AD1` sobre preto dá 2.9:1 e reprova em acessibilidade, então o roxo
 * sobe para `purple[300]`.
 */
export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    brand: purple[300],
    brandPressed: purple[200],
    brandSubtle: purple[900],
    onBrand: neutral[900],

    background: '#121212',
    surface: '#1C1C1E',
    surfaceSunken: '#121212',
    border: '#2A2A2E',
    divider: '#2A2A2E',

    text: neutral[0],
    textSecondary: neutral[300],
    textTertiary: neutral[500],
    onSurfaceInverted: neutral[900],

    expense: neutral[0],
    skeleton: '#2A2A2E',
    scrim: 'rgba(0,0,0,0.6)',
  },
} as const;

export type AppTheme = typeof lightTheme;
