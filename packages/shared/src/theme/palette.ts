/**
 * Âmbar dourado — trocou o roxo original porque colidia com o Nubank. Não é
 * uma rampa numérica como as outras porque `brandPressed` (o texto sobre
 * âmbar em botão escuro) não fica ao longo do mesmo matiz, é um marrom
 * escuro deliberado — ver `design_handoff_dindim/README.md`.
 */
export const amber = {
  light: { brand: '#B8860B', brandPressed: '#5A4A1F', brandSubtle: '#FBF2DC', onBrand: '#FFFFFF' },
  dark: { brand: '#D9A441', brandPressed: '#C4903A', brandSubtle: '#3A2F16', onBrand: '#121212' },
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
  '#B8860B', '#00A868', '#F5A623', '#E24141', '#0A84D1',
  '#D10A8E', '#4A4A9E', '#0AB5B5', '#8E6B3F', '#5A4A1F',
] as const;

export type AccentColor = (typeof accentPalette)[number];
