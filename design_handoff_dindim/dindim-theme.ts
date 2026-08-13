/** dindim-theme.ts — tokens para packages/shared/src/theme */
export const radius = { sm: 8, md: 16, lg: 24, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const lightColors = {
  brand: '#B8860B', brandPressed: '#5A4A1F', brandSubtle: '#FBF2DC', onBrand: '#FFFFFF',
  background: '#F4F4F6', surface: '#FFFFFF', border: '#E9E9EE',
  text: '#191919', textSecondary: '#71717A', textTertiary: '#A1A1AA',
  income: '#00A868', danger: '#E24141', warning: '#F5A623',
} as const;

export const darkColors = {
  brand: '#D9A441', brandPressed: '#C4903A', brandSubtle: '#3A2F16', onBrand: '#121212',
  background: '#121212', surface: '#1C1C1C', border: '#2E2E2E',
  text: '#F2F2F2', textSecondary: '#A5A5A5', textTertiary: '#6E6E6E',
  income: '#2FCB84', danger: '#FF6B6B', warning: '#F5A623',
} as const;

export const typography = {
  family: { regular: 'InterTight_400Regular', medium: 'InterTight_500Medium', semibold: 'InterTight_600SemiBold' },
  size: { caption: 12, footnote: 13, body: 15, callout: 17, title: 20, heading: 24, display: 28, hero: 30 },
} as const;
