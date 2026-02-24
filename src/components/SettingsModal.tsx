import { useState } from 'react';
import { Settings, MessageSquare, Download, Upload, Info, X, RefreshCw, BookOpen } from 'lucide-react';
import type { Language } from '../types';
import { t } from '../i18n';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface Props {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
  onExport: () => void;
  onShowTutorial: () => void;
}

export function SettingsModal({ lang, isOpen, onClose, onImport, onExport, onShowTutorial }: Props) {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  if (!isOpen) return null;

  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.1';

  const handleReportBug = () => {
    const subject = encodeURIComponent(t(lang, 'reportBugSubject'));
    // Replace {version} and {lang}
    let body = t(lang, 'reportBugBody');
    body = body.replace('{version}', version).replace('{lang}', lang.toUpperCase());
    const bodyEncoded = encodeURIComponent(body);
    
    window.location.href = `mailto:support@dikr.app?subject=${subject}&body=${bodyEncoded}`;
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de maj:', error);
    } finally {
      setTimeout(() => setIsCheckingUpdate(false), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center gap-2 text-white">
            <Settings size={20} className="text-blue-400" />
            <h2 className="font-semibold text-lg">{t(lang, 'settingsTitle')}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex flex-col gap-6">
          
          {/* Section: Sauvegarde */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase text-slate-500 mb-1">
              Data
            </div>
            <button 
              onClick={() => { onExport(); onClose(); }}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 transition-colors"
            >
              <Upload size={18} className="text-indigo-400" />
              <span className="text-sm font-medium">{t(lang, 'exportData')}</span>
            </button>
            <button 
              onClick={() => { onImport(); onClose(); }}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 transition-colors"
            >
              <Download size={18} className="text-indigo-400" />
              <span className="text-sm font-medium">{t(lang, 'importData')}</span>
            </button>
          </div>

          {/* Section: Aide & Contact */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase text-slate-500 mb-1">
              Help & Support
            </div>
            <button 
              onClick={() => { onShowTutorial(); onClose(); }}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 transition-colors"
            >
              <BookOpen size={18} className="text-emerald-400" />
              <span className="text-sm font-medium">{t(lang, 'showTutorial')}</span>
            </button>
            <button 
              onClick={handleReportBug}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 text-slate-200 transition-colors"
            >
              <MessageSquare size={18} className="text-rose-400" />
              <span className="text-sm font-medium">{t(lang, 'reportBug')}</span>
            </button>
          </div>

          {/* Section: Version & Mise à jour */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase text-slate-500 mb-1">
              {t(lang, 'appVersion')}
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-700/20 text-slate-300">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-blue-400" />
                <span className="text-sm font-medium">v{version}</span>
              </div>
            </div>

            {needRefresh ? (
               <div className="mt-2 p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex flex-col gap-3">
                 <p className="text-sm text-emerald-300 font-medium">{t(lang, 'updateAvailable')}</p>
                 <button 
                   onClick={() => updateServiceWorker(true)}
                   className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
                 >
                   {t(lang, 'updateNow')}
                 </button>
               </div>
            ) : (
              <button 
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                className="flex items-center justify-center gap-2 w-full p-3 mt-1 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 text-slate-400 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isCheckingUpdate ? "animate-spin" : ""} />
                <span className="text-sm">{isCheckingUpdate ? "..." : t(lang, 'checkUpdate')}</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
