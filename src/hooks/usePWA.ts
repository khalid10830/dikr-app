import { useState, useEffect } from 'react';

export function usePWA() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est lancée en mode standalone (PWA installée)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    
    // Définir l'état initial
    setIsStandalone(mediaQuery.matches || (window.navigator as any).standalone === true);

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
