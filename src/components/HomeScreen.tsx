import { useState, useEffect } from 'react';
import { Target, Infinity as InfinityIcon, Ruler, History, Plus, Trash2, Globe, Edit3, X, Download, Share2, Github, Settings as SettingsIcon } from 'lucide-react';
import type { Screen, SessionMode, DikrItem, Language, DikrSession } from '../types';
import { t, dikrTemplates } from '../i18n';
import { getStatsByFilter, formatTime } from '../utils/stats';
import { SettingsModal } from './SettingsModal';
import { usePWA } from '../hooks/usePWA';

interface Props {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  history: DikrSession[];
  dikrs: DikrItem[];
  onAddDikr: (name: string) => void;
  onDeleteDikr: (id: string) => void;
  onEditDikr: (id: string, newName: string) => void;
  onStartSession: (dikrId: string, mode: SessionMode, target?: number) => void;
  onNavigate: (screen: Screen) => void;
  onViewHistory: (dikrId?: string) => void;
  onShowOnboarding: () => void;
}

export function HomeScreen({ lang, onChangeLang, history, dikrs, onAddDikr, onDeleteDikr, onEditDikr, onStartSession, onViewHistory, onShowOnboarding }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isStandalone } = usePWA();
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'prompt' | 'confirm';
    title: string;
    message?: string;
    onConfirm: (val?: string) => void;
  }>({ isOpen: false, type: 'confirm', title: '', onConfirm: () => {} });
  const [modalInput, setModalInput] = useState('');

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(t(lang, 'installIOSInstruction'));
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddDikr(newName.trim());
      setNewName('');
      setShowCustomInput(false);
      setIsAdding(false);
    }
  };

  const handleAddTemplate = (text: string) => {
    onAddDikr(text);
    setIsAdding(false);
  };

  const handlePromptTarget = (dikrId: string) => {
    setModalInput("100");
    setModalConfig({
      isOpen: true,
      type: 'prompt',
      title: t(lang, 'targetMode'),
      message: t(lang, 'targetPrompt'),
      onConfirm: (val) => {
        const num = parseInt(val || '', 10);
        if (!isNaN(num) && num > 0) {
          onStartSession(dikrId, 'target', num);
        }
      }
    });
  };

  const toggleLang = () => {
    if (lang === 'fr') onChangeLang('en');
    else if (lang === 'en') onChangeLang('ar');
    else onChangeLang('fr');
  };

  const handleExport = () => {
    const data = {
      dikrs: JSON.parse(localStorage.getItem('dikr-list') || '[]'),
      history: JSON.parse(localStorage.getItem('dikr-history') || '[]'),
      lang: JSON.parse(localStorage.getItem('app-lang') || '"fr"'),
      onboarding: JSON.parse(localStorage.getItem('has-seen-onboarding') || 'true')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dikr-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.dikrs && data.history) {
          localStorage.setItem('dikr-list', JSON.stringify(data.dikrs));
          localStorage.setItem('dikr-history', JSON.stringify(data.history));
          if (data.lang) localStorage.setItem('app-lang', JSON.stringify(data.lang));
          if (data.onboarding !== undefined) localStorage.setItem('has-seen-onboarding', JSON.stringify(data.onboarding));
          window.location.reload();
        } else {
          alert(t(lang, 'importError'));
        }
      } catch (err) {
        alert(t(lang, 'importError'));
      }
    };
    reader.readAsText(file);
  };

  const handleShare = async () => {
    const shareData = {
      title: t(lang, 'appTitle'),
      text: t(lang, 'onboardingDesc'),
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Lien copié ! / Link copied !");
      }
    } catch (err) {
      console.log('Erreur de partage:', err);
    }
  };

  const globalStats = getStatsByFilter(history, 'all');
  const todayStats = getStatsByFilter(history, 'today');
  const templates = dikrTemplates[lang] || dikrTemplates['fr'];

  return (
    <div className="flex flex-col w-full max-w-md p-6 min-h-screen relative">
      
      {/* Header Controls (Fixed top) */}
      <div className="absolute top-6 left-6 z-10 animate-in fade-in">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-colors shadow-lg"
          title={t(lang, 'settingsTitle')}
        >
          <SettingsIcon size={20} />
        </button>
      </div>

      <div className="absolute top-6 right-6 z-10 animate-in fade-in flex items-center gap-2">
        <button 
          onClick={toggleLang}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors text-xs font-semibold uppercase shadow-lg"
        >
          <Globe size={14} />
          {lang}
        </button>
      </div>

      <header className="mt-8 mb-8 text-center animate-in fade-in">
        <img src="/icon.png" alt="Dikr icon" className="w-20 h-20 mx-auto mb-4 rounded-full shadow-xl shadow-blue-900/20 border border-slate-700/50 object-cover" />
        <h1 className="text-4xl font-normal leading-relaxed text-blue-50 mb-6 font-quran drop-shadow-md" dir="rtl">{t(lang, 'appTitle')}</h1>
        
        <div 
          onClick={() => onViewHistory()}
          className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-6 cursor-pointer hover:bg-slate-800 transition-colors flex flex-col shadow-lg backdrop-blur-sm relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between w-full relative z-10 gap-2">
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs font-medium text-slate-400">{t(lang, 'today')}</span>
              <span className="text-xl font-bold text-blue-400 mt-0.5">{todayStats.count}</span>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs font-medium text-slate-400">{t(lang, 'targetsReached')}</span>
              <span className="text-xl font-bold text-emerald-400 mt-0.5 flex items-center justify-center"><Target size={14} className="mr-1" />{globalStats.targetsReached}</span>
            </div>
            
            <div className="flex flex-col items-center flex-1">
              <span className="text-xs font-medium text-slate-400">{t(lang, 'timeSpent')}</span>
              <span className="text-xl font-bold text-amber-400 mt-0.5" dir="ltr">{formatTime(globalStats.timeMs, lang)}</span>
            </div>
            
            <div className="pl-2 border-l border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors">
               <div className="w-10 h-10 rounded-full bg-slate-700/50 flex flex-col items-center justify-center">
                 <History size={18} />
                 <span className="text-[9px] mt-0.5" style={{lineHeight:'1'}}>{lang === 'ar' ? 'سجل' : 'Log'}</span>
               </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between mb-4 animate-in fade-in">
        <h2 className="text-lg font-semibold text-slate-200">
          {t(lang, 'myDikrs')} <span className="text-slate-500 ml-2 text-sm font-normal">({dikrs.length})</span>
        </h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-2 rounded-full bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <ul className="flex flex-col gap-4 flex-1 pb-10">
        {dikrs.map((dikr, i) => (
          <li key={dikr.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex flex-col gap-4 relative group animate-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}>
            
            <div className="flex justify-between items-start gap-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <h3 className="text-lg font-medium text-white leading-tight break-words">{dikr.name}</h3>
                
                {dikr.durationMs && (
                   <div className="text-xs text-slate-400 bg-slate-800/60 px-2 py-1.5 rounded-md inline-block self-start border border-slate-700/30">
                     {t(lang, 'calibrated')}: <span className="font-mono text-slate-300 ml-1">{(dikr.durationMs / 1000).toFixed(1)}s</span>
                   </div>
                )}
                
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {(() => {
                    const s = getStatsByFilter(history.filter(h => h.dikrId === dikr.id), 'today');
                    return s.count > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap" dir="ltr">
                        <span className="text-xs font-medium text-blue-300 bg-blue-900/30 px-2 py-1 rounded-md">
                          {t(lang, 'todayCountShort')} {s.count}
                        </span>
                        {s.targetsReached > 0 && (
                          <span className="text-xs font-medium text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded-md flex items-center">
                            <Target size={10} className="mr-1" />{s.targetsReached}
                          </span>
                        )}
                        {s.timeMs > 0 && (
                           <span className="text-xs font-medium text-amber-300 bg-amber-900/30 px-2 py-1 rounded-md">
                             {formatTime(s.timeMs, lang)}
                           </span>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1 shrink-0 bg-slate-800/80 rounded-lg backdrop-blur p-1">
                <button 
                  onClick={() => onViewHistory(dikr.id)}
                  className="text-slate-500 hover:text-blue-400 transition-colors p-1.5"
                  title={t(lang, 'journalTitle')}
                >
                  <History size={16} />
                </button>
                <button 
                  onClick={() => {
                    setModalInput(dikr.name);
                    setModalConfig({
                      isOpen: true,
                      type: 'prompt',
                      title: "Renommer",
                      onConfirm: (val) => {
                        if (val && val.trim()) onEditDikr(dikr.id, val.trim());
                      }
                    });
                  }}
                  className="text-slate-500 hover:text-emerald-400 transition-colors p-1.5"
                  title="Renommer"
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => {
                    setModalConfig({
                      isOpen: true,
                      type: 'confirm',
                      title: "Supprimer",
                      message: "Voulez-vous vraiment supprimer ce dikr ?",
                      onConfirm: () => onDeleteDikr(dikr.id)
                    });
                  }}
                  className="text-slate-500 hover:text-red-400 transition-colors p-1.5"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>


            {!dikr.durationMs ? (
              <button
                onClick={() => onStartSession(dikr.id, 'calibration')}
                className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mt-2"
              >
                <Ruler size={18} />
                {t(lang, 'calibrateBtn')}
              </button>
            ) : (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onStartSession(dikr.id, 'free')}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-colors flex flex-col items-center justify-center gap-1"
                >
                  <InfinityIcon size={20} className="text-emerald-400" />
                  <span className="text-sm">{t(lang, 'freeMode')}</span>
                </button>
                <button
                  onClick={() => handlePromptTarget(dikr.id)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-medium transition-colors flex flex-col items-center justify-center gap-1"
                >
                  <Target size={20} className="text-purple-400" />
                  <span className="text-sm">{t(lang, 'targetMode')}</span>
                </button>
                <button
                  title={t(lang, 'recalibrateBtn')}
                  onClick={() => onStartSession(dikr.id, 'calibration')}
                  className="w-14 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 py-3 rounded-xl transition-colors flex flex-col items-center justify-center shrink-0"
                >
                  <Ruler size={18} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Footer Actions */}
      <div className="mt-8 flex flex-col items-center justify-center gap-6 text-sm pb-16">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={handleShare} className="text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-full px-5 py-2.5 transition-colors flex items-center gap-2 font-medium border border-slate-700">
             <Share2 size={16} /> {t(lang, 'shareAppShort' as any)}
          </button>
          
          {!isStandalone && (
            <button onClick={handleInstallClick} className="text-white bg-blue-600 hover:bg-blue-500 rounded-full px-5 py-2.5 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-900/20">
               <Download size={16} /> {t(lang, 'installAppShort' as any)}
            </button>
          )}
        </div>
        
        <a 
          href="https://github.com/khalid10830/dikr-app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-400 transition-colors pt-5 border-t border-slate-800/50 w-full max-w-[250px]"
        >
          <Github size={14} />
          <span className="text-xs font-medium">Open Source</span>
          <span className="text-[10px] opacity-40 mx-1">•</span>
          <span className="text-[10px] opacity-70">© 2026</span>
        </a>
      </div>
      
      <SettingsModal 
        lang={lang}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onImport={() => {
          // Trigger file input click programmatically since we removed it from DOM
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = handleImport as any;
          input.click();
        }}
        onExport={handleExport}
        onShowTutorial={onShowOnboarding}
      />
      
      {/* ADD DIKR OVERLAY MODAL */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md max-h-[85vh] rounded-2xl shadow-2xl z-10 flex flex-col animate-in zoom-in-95 duration-200">
            <header className="flex items-center justify-between p-4 border-b border-slate-700">
               <h3 className="text-lg font-semibold text-white">{t(lang, 'suggestedDikrs')}</h3>
               <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </header>
            
            <div className="overflow-y-auto p-4 flex-1">
              {showCustomInput ? (
                <form onSubmit={handleAddCustom} className="flex flex-col gap-4 animate-in slide-in-from-right-4">
                  <h4 className="text-sm font-medium text-slate-400">{t(lang, 'customDikrLabel')}</h4>
                  <textarea 
                    autoFocus
                    rows={4}
                    placeholder={t(lang, 'customDikrPlaceholder')}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowCustomInput(false)} className="flex-1 bg-slate-700 text-white rounded-xl py-3 font-medium">{t(lang, 'cancelBtn')}</button>
                    <button type="submit" disabled={!newName.trim()} className="flex-1 bg-blue-600 text-white rounded-xl py-3 font-medium disabled:opacity-50">{t(lang, 'addBtn')}</button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setShowCustomInput(true)}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-600/20 transition-colors mb-4"
                  >
                    <Edit3 size={20} />
                    <span className="font-medium">{t(lang, 'addCustomDikr')}</span>
                  </button>
                  
                  {templates.map((tpl, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleAddTemplate(tpl)}
                      className="text-left bg-slate-800/50 hover:bg-slate-700 p-4 rounded-xl border border-slate-700/50 transition-colors"
                      dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    >
                      <span className="text-slate-200 text-sm leading-relaxed block">{tpl}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Global Modals (Prompt / Confirm) */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
          <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl z-10 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="p-6 flex flex-col gap-4 text-center">
              <h3 className="text-xl font-semibold text-white">{modalConfig.title}</h3>
              {modalConfig.message && <p className="text-slate-400 text-sm">{modalConfig.message}</p>}
              
              {modalConfig.type === 'prompt' && (
                <input 
                  type="text"
                  autoFocus
                  value={modalInput}
                  onChange={(e) => setModalInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-center mt-2"
                />
              )}
            </div>
            <div className="flex border-t border-slate-700">
              <button 
                onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
                className={`flex-1 py-4 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors font-medium border-slate-700 ${lang === 'ar' ? 'border-l' : 'border-r'}`}
              >
                {t(lang, 'cancelBtn')}
              </button>
              <button 
                onClick={() => {
                  modalConfig.onConfirm(modalInput);
                  setModalConfig(prev => ({ ...prev, isOpen: false }));
                }} 
                className="flex-1 py-4 text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 transition-colors font-medium focus:outline-none"
              >
                {/* On utilise un texte générique comme Valider ou Confirmer */}
                {modalConfig.type === 'confirm' ? 'OK' : t(lang, 'addBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
