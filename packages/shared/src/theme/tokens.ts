import { amber, neutral, semantic } from './palette.js';

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
    display: 28,
    hero: 30,
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
    // O âmbar ocupa ~15% da tela: header, FAB, estado ativo, barra de progresso.
    brand: amber.light.brand,
    brandPressed: amber.light.brandPressed,
    brandSubtle: amber.light.brandSubtle,
    onBrand: amber.light.onBrand,

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
 * Modo escuro — tokens exatos de `design_handoff_dindim/dindim-theme.ts`.
 * Hoje só a Home tem versão dark implementada no protótipo; as demais telas
 * herdam os mesmos tokens quando forem portadas.
 */
export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    brand: amber.dark.brand,
    brandPressed: amber.dark.brandPressed,
    brandSubtle: amber.dark.brandSubtle,
    onBrand: amber.dark.onBrand,

    background: '#121212',
    surface: '#1C1C1C',
    surfaceSunken: '#121212',
    border: '#2E2E2E',
    divider: '#2E2E2E',

    text: '#F2F2F2',
    textSecondary: '#A5A5A5',
    textTertiary: '#6E6E6E',
    onSurfaceInverted: neutral[900],

    income: '#2FCB84',
    expense: '#F2F2F2',
    danger: '#FF6B6B',
    skeleton: '#2E2E2E',
    scrim: 'rgba(0,0,0,0.6)',
  },
} as const;

/**
 * `lightTheme`/`darkTheme` são `as const`, então cada cor tem um tipo literal
 * próprio (`"#B8860B"` etc.) — sem isso, `darkTheme` não é atribuível a um
 * `AppTheme` inferido de `lightTheme` (os hex divergem). `colors` é alargado
 * para `string`; o resto (radius/space/typography) é idêntico nos dois temas.
 */
export type AppTheme = Omit<typeof lightTheme, 'colors'> & {
  colors: Record<keyof typeof lightTheme.colors, string>;
};
