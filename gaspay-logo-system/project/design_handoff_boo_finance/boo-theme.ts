/**
 * boo-theme.ts — substituição de packages/shared/src/theme para a identidade Boo Finance.
 * Mantém a estrutura de lightTheme; só mudam os valores + tokens de gamificação.
 */
export const radius = { sm: 12, md: 20, lg: 28, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const booColors = {
  brand: '#7A5AF8',
  brandPressed: '#6344E0',
  brandSubtle: '#EDE8FF',
  onBrand: '#FFFFFF',

  background: '#F4F0FF',
  surface: '#FFFFFF',
  surfaceSunken: '#FBFAFF',
  border: '#E3DBFB',
  divider: '#E3DBFB',

  text: '#241C46',
  textSecondary: '#7A6FA8',
  textTertiary: '#ABA1CE',

  income: '#2ECC9A',
  expense: '#241C46',
  danger: '#FF6B6B',
  warning: '#FFC145',

  // gamificação
  coin: '#FFC145',
  xp: '#4CC9F0',
  quest: '#FF7BC8',
  shadow: '#DCD3F7',

  xpTrack: '#E9E2FC',
  skeleton: '#EFECF9',
  scrim: 'rgba(36,28,70,0.45)',
} as const;

export const booTypography = {
  family: {
    regular: 'Nunito_400Regular',
    medium: 'Nunito_500Medium',
    bold: 'Nunito_700Bold',
    extrabold: 'Nunito_800ExtraBold',
  },
  size: {
    caption: 12, footnote: 13, body: 15, callout: 17,
    title: 20, heading: 24, display: 28, hero: 34,
  },
} as const;

/** Sombra 2D: sempre sólida, só no eixo Y. */
export const chunky = {
  card: { offset: 4, color: booColors.shadow },
  button: { offset: 5, color: booColors.brandPressed },
  field: { offset: 3, color: booColors.shadow },
  borderWidth: 2,
} as const;
