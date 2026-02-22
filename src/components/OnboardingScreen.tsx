import { Clock, Ruler, Sparkles } from 'lucide-react';
import type { Language } from '../types';
import { t } from '../i18n';

interface Props {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onFinish: () => void;
}

export function OnboardingScreen({ lang, onChangeLang, onFinish }: Props) {
  return (
    <div className="flex flex-col items-center justify-between w-full min-h-screen max-w-md p-6 bg-slate-900 animate-in fade-in duration-500 overflow-y-auto">
      
      {/* Header Language Selector (Fixed position to avoid RTL/LTR layout shift) */}
      <div className="absolute top-6 right-6 z-10 animate-in fade-in" dir="ltr">
        <div className="flex bg-slate-800 rounded-full p-1 border border-slate-700 shadow-lg">
          {(['fr', 'en', 'ar'] as Language[]).map(l => (
            <button
              key={l}
              onClick={() => onChangeLang(l)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase transition-colors ${
                lang === l ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {l === 'ar' ? 'العربية' : l}
            </button>
          ))}
        </div>
      </div>

      <main className="flex flex-col items-center text-center flex-1 w-full max-w-sm mt-20">
        <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-900/20 border border-slate-700/50 p-1 overflow-hidden">
          <img src="/icon.png" alt="Dikr icon" className="w-full h-full object-cover rounded-full" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">{t(lang, 'onboardingTitle')}</h1>
        <p className="text-slate-400 mb-10">{t(lang, 'onboardingDesc')}</p>

        {/* Feature Cards */}
        <div className="flex flex-col gap-4 w-full mb-10 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl flex gap-4">
             <div className="text-blue-400 mt-1"><Clock size={24} /></div>
             <div>
               <h3 className="font-semibold text-lg text-blue-300 mb-2">{t(lang, 'methodTitle')}</h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              {t(lang, 'methodDesc')}
            </p>
             </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700 p-5 rounded-2xl flex flex-col gap-4">
             <div className="flex gap-4">
                <div className="text-emerald-400 mt-1"><Ruler size={24} /></div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{t(lang, 'onboardingStep1Title')}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{t(lang, 'onboardingStep1Desc')}</p>
                </div>
             </div>
             <div className="h-px bg-slate-700/50 w-full" />
             <div className="flex gap-4">
                <div className="text-purple-400 mt-1"><Sparkles size={24} /></div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{t(lang, 'onboardingStep2Title')}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{t(lang, 'onboardingStep2Desc')}</p>
                </div>
             </div>
          </div>
        </div>
        <div className="flex-1" />
      </main>

      {/* Action footer */}
      <div className="w-full max-w-sm sticky bottom-0 bg-slate-900 pt-4 pb-8 border-t border-slate-800/50">
        <button
          onClick={onFinish}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {t(lang, 'onboardingStartBtn')}
        </button>
      </div>

    </div>
  );
}
