import { darkTheme, lightTheme, type AppTheme } from '@dindim/shared';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface ThemeContextValue {
  theme: AppTheme;
  isDark: boolean;
  setDark: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Modo escuro é, por enquanto, só da Home (única tela com versão dark no
 * protótipo — ver `design_handoff_dindim/README.md`). O toggle mora aqui,
 * de nível de app, porque é acionado no Perfil mas lido na Home.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setDark] = useState(false);
  const value = useMemo<ThemeContextValue>(
    () => ({ theme: isDark ? darkTheme : lightTheme, isDark, setDark }),
    [isDark],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de um ThemeProvider');
  return ctx;
}
