export const purple = {
  50: '#F6EDFD', 100: '#E9D6FA', 200: '#D0AAF4', 300: '#B77EED',
  400: '#9E52E6', 500: '#820AD1', 600: '#6E09B0', 700: '#5A078F',
  800: '#46066F', 900: '#2E0449',
} as const;

export const neutral = {
  0: '#FFFFFF', 50: '#F4F4F6', 100: '#E9E9EE', 200: '#D4D4D8',
  300: '#A1A1AA', 500: '#71717A', 700: '#3D3D42', 900: '#191919',
} as const;

export const semantic = {
  positive: '#00A868',   // só entradas
  negative: '#E24141',   // só erro real: estouro de orçamento, falha de sync
  warning: '#F5A623',
} as const;

/**
 * Paleta de cor para contas e categorias criadas pelo usuário.
 * Deliberadamente curta: cor aqui é etiqueta, não decoração.
 */
export const accentPalette = [
  '#820AD1', '#00A868', '#F5A623', '#E24141', '#0A84D1',
  '#D10A8E', '#4A4A9E', '#0AB5B5', '#8E6B3F', '#5A078F',
] as const;

export type AccentColor = (typeof accentPalette)[number];
