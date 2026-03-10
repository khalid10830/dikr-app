import React, { useState } from 'react';
import { useDetectInstall } from '../hooks/useDetectInstall';
import { X, Share, Compass } from 'lucide-react';
import { t } from '../i18n';
import type { Language } from '../types';

interface InstallBannerProps {
  lang: Language;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ lang }) => {
  const { environment } = useDetectInstall();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || environment === 'standalone' || environment === 'other' || environment === 'android') {
    return null;
  }

  return (
    <div className={`w-full ${environment === 'ios-inapp' ? 'bg-amber-600/90' : 'bg-slate-800'} border-b border-slate-700/50 p-4 relative text-sm backdrop-blur-sm z-40 shadow-sm`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-700 transition"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="mt-0.5 flex-shrink-0">
          {environment === 'ios-inapp' ? (
            <Compass size={20} className="text-white animate-pulse" />
          ) : (
            <Share size={20} className="text-blue-400" />
          )}
        </div>
        <p className="text-slate-100 leading-snug">
          {environment === 'ios-inapp' 
            ? t(lang, 'installPromptInApp') 
            : t(lang, 'installPromptSafari')}
        </p>
      </div>
    </div>
  );
};
