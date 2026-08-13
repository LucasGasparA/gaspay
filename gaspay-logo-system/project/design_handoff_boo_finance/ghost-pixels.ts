/** ghost-pixels.ts — mascote Boo em bitmap 16x16. */
export const GHOST_PX = [
  '......KKKK......',
  '....KKWWWWKK....',
  '...KWWWWWWWWK...',
  '..KWWWWWWWWWWK..',
  '.KWWWWWWWWWWWWK.',
  '.KWWWWWWWWWWWWK.',
  'KWWWWWWWWWWWWWWK',
  'KWWWEEWWWWEEWWWK',
  'KWWWEEWWWWEEWWWK',
  'KWWBBWWWWWWBBWWK',
  'KWWWWWWWWWWWWWWK',
  'KWWWWWSSSSWWWWWK',
  '.KWWWSSSSSSWWWK.',
  '.KWSSSSSSSSSSWK.',
  '.KSSKKSSSSKKSSK.',
  '..KK..KKKK..KK..',
] as const;

export const GHOST_COLORS: Record<string, string> = {
  K: '#241C46', // contorno
  W: '#F5F2F0', // corpo
  S: '#CFC8D6', // sombra
  E: '#241C46', // olhos
  B: '#E8A79B', // bochecha
};
