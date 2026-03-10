import { useState, useEffect } from 'react';

type InstallEnvironment = 'ios-safari' | 'ios-inapp' | 'android' | 'standalone' | 'other';

export const useDetectInstall = () => {
  const [environment, setEnvironment] = useState<InstallEnvironment>('other');

  useEffect(() => {
    // Check if it's already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
      
    if (isStandalone) {
      setEnvironment('standalone');
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    
    // Check for iOS
    const isIOS = /iphone|ipad|ipod/.test(ua);
    
    if (isIOS) {
      // In-app browsers often add specific strings to the UA
      // FBAN/FBAV: Facebook
      // Instagram: Instagram
      // WhatsApp: WhatsApp (though sometimes relies on FB or generic webview)
      // Line: Line
      // Twitter: Twitter
      const isInAppBrowser = /fbsv|fban|fbav|instagram|whatsapp|line|twitter|wv|safari-line/.test(ua);
      
      // Also check standard Safari (contains 'safari' but NOT 'chrome'/'crios', though Chrome on iOS 17+ supports PWA now)
      // It's safer to flag known in-app browsers as restrictions.
      
      if (isInAppBrowser) {
        setEnvironment('ios-inapp');
      } else {
        setEnvironment('ios-safari');
      }
      return;
    }
    
    // Android or other
    const isAndroid = /android/.test(ua);
    if (isAndroid) {
      setEnvironment('android');
      return;
    }
    
    setEnvironment('other');

  }, []);

  return { environment };
};
