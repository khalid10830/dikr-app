import { useState, useEffect } from 'react';

export function usePWA() {
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const nav = window.navigator as Navigator & { standalone?: boolean };
    return mediaQuery.matches || nav.standalone === true;
  });

  useEffect(() => {
    // Vérifier si l'app est lancée en mode standalone (PWA installée)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    // Écouter les changements (si l'utilisateur installe l'app pendant qu'il l'utilise)
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback pour anciens navigateurs
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return { isStandalone };
}
