import { Clock, Ruler, Sparkles, Heart } from 'lucide-react';
import type { Language } from '../types';
import { t } from '../i18n';

interface Props {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  onFinish: () => void;
  fromHomeScreen?: boolean;
}

export function OnboardingScreen({ lang, onChangeLang, onFinish, fromHomeScreen = false }: Props) {
  return (
    <div className="relative flex flex-col items-center justify-between w-full min-h-[100dvh] max-w-md mx-auto p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black overflow-y-auto overflow-x-hidden selection:bg-blue-500/30">
      
      {/* Background glowing orbs */}
      <div className="absolute top-0 inset-x-0 h-64 bg-blue-600/20 blur-[100px] -z-10 rounded-full" />
      <div className="absolute bottom-1/3 -right-20 w-64 h-64 bg-emerald-600/10 blur-[100px] -z-10 rounded-full" />

      {/* Language Selector */}
      <div className="w-full flex justify-end z-10 mb-2 animate-in fade-in slide-in-from-top-4" dir="ltr">
        <div className="flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
          {(['fr', 'en', 'ar'] as Language[]).map(l => (
            <button
              key={l}
              onClick={() => onChangeLang(l)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all duration-300 ${
                lang === l 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md scale-105' 
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {l === 'ar' ? 'العربية' : l}
            </button>
          ))}
        </div>
      </div>

      <main className="flex flex-col items-center text-center flex-1 w-full mt-4 z-10 animate-in zoom-in-95 duration-500">
        
        {/* Logo with glow */}
        <div className="relative mb-6 group cursor-default">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 delay-75" />
          <div className="w-20 h-20 bg-gradient-to-b from-blue-500/10 to-transparent flex items-center justify-center rounded-full border border-blue-500/30 shadow-xl relative z-10 p-1">
            <img src="/icon.png" alt="Dikr icon" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-slate-300 mb-2 tracking-tight">
          {t(lang, 'onboardingTitle')}
        </h1>
        <p className="text-slate-400 text-sm mb-6 max-w-[280px] leading-relaxed">
          {t(lang, 'onboardingDesc')}
        </p>

        {/* Features - Compact Glassmorphic Grid */}
        <div className="w-full flex flex-col gap-3 text-left animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          
          {/* Pitch */}
          <div className="bg-gradient-to-r from-blue-900/40 to-slate-800/40 backdrop-blur-md border border-blue-500/20 p-4 rounded-2xl flex items-start gap-4 hover:border-blue-500/40 transition-colors">
            <div className="bg-rose-500/20 p-2.5 rounded-xl text-rose-400 shadow-inner shrink-0 mt-0.5"><Heart size={20} className="fill-rose-400/20" /></div>
            <div className="flex flex-col gap-1.5 leading-relaxed">
              {t(lang, 'onboardingPitch').split('\n').map((line, i) => (
                <p key={i} className={i === 0 ? 'text-blue-50 font-semibold text-[15px]' : 'text-slate-300 text-xs'}>{line}</p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 relative">
            
            {/* Method */}
            <div className="col-span-2 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors">
              <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400 shadow-inner"><Clock size={20} /></div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-50 text-sm mb-0.5">{t(lang, 'methodTitle')}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{t(lang, 'methodDesc')}</p>
              </div>
            </div>

            {/* Step 1 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col gap-2 hover:bg-white/10 transition-colors">
              <div className="bg-emerald-500/20 p-2 w-fit rounded-xl text-emerald-400 shadow-inner"><Ruler size={18} /></div>
              <div>
                <h3 className="text-emerald-50 font-semibold text-sm mb-1">{t(lang, 'onboardingStep1Title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t(lang, 'onboardingStep1Desc')}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col gap-2 hover:bg-white/10 transition-colors">
              <div className="bg-purple-500/20 p-2 w-fit rounded-xl text-purple-400 shadow-inner"><Sparkles size={18} /></div>
              <div>
                <h3 className="text-purple-50 font-semibold text-sm mb-1">{t(lang, 'onboardingStep2Title')}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t(lang, 'onboardingStep2Desc')}</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Action footer */}
      <div className="w-full mt-6 mb-2 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <button
          onClick={onFinish}
          className="group relative w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-2xl" />
          <span className="relative z-10 tracking-wide">{fromHomeScreen ? t(lang, 'backBtn') : t(lang, 'onboardingStartBtn')}</span>
        </button>
      </div>

    </div>
  );
}
