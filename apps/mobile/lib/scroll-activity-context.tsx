import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

interface ScrollActivityContextValue {
  isScrolling: boolean;
  /** Chamado a cada evento de scroll das telas com lista (Home, Extrato, Metas, Contas). */
  reportScroll: (offsetY: number) => void;
}

const ScrollActivityContext = createContext<ScrollActivityContextValue | null>(null);

/** Sem movimento por esse tempo, os rótulos da tab bar voltam (ver DDM-10). */
const IDLE_DELAY_MS = 180;
/** Considerado "no topo" — volta o rótulo na hora, sem esperar o debounce. */
const TOP_THRESHOLD = 4;

export function ScrollActivityProvider({ children }: { children: ReactNode }) {
  const [isScrolling, setIsScrolling] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reportScroll = useCallback((offsetY: number) => {
    if (timer.current) clearTimeout(timer.current);

    if (offsetY <= TOP_THRESHOLD) {
      setIsScrolling(false);
      return;
    }

    setIsScrolling(true);
    timer.current = setTimeout(() => setIsScrolling(false), IDLE_DELAY_MS);
  }, []);

  const value = useMemo(() => ({ isScrolling, reportScroll }), [isScrolling, reportScroll]);

  return <ScrollActivityContext.Provider value={value}>{children}</ScrollActivityContext.Provider>;
}

export function useScrollActivity(): ScrollActivityContextValue {
  const ctx = useContext(ScrollActivityContext);
  if (!ctx) throw new Error('useScrollActivity precisa estar dentro de um ScrollActivityProvider');
  return ctx;
}

interface ScrollEventLike {
  nativeEvent: { contentOffset: { y: number } };
}

/** Spread em qualquer ScrollView/SectionList/FlatList: `<ScrollView {...useScrollActivityHandler()}>`. */
export function useScrollActivityHandler(): {
  onScroll: (event: ScrollEventLike) => void;
  scrollEventThrottle: number;
} {
  const { reportScroll } = useScrollActivity();
  return {
    onScroll: (event: ScrollEventLike) => reportScroll(event.nativeEvent.contentOffset.y),
    scrollEventThrottle: 16,
  };
}
