import { useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, X as XIcon, CheckCircle2, Check } from 'lucide-react';
import type { SessionMode, DikrItem, Language, SessionEvent } from '../types';
import { t } from '../i18n';

interface Props {
  lang: Language;
  dikr: DikrItem;
  mode: SessionMode;
  targetCount?: number;
  
  elapsedTime: number;
  isRunning: boolean;
  sessionEvents: SessionEvent[];
  onToggle: () => void;
  
  onCancel: () => void;
  onFinish: () => void;
  onNavigateHome: () => void;
}

export function SessionScreen({ 
  lang, dikr, mode, targetCount, elapsedTime, isRunning, sessionEvents, onToggle, onCancel, onFinish, onNavigateHome 
}: Props) {

  const durationMs = dikr.durationMs || 1000; 
  const currentCount = Math.floor(elapsedTime / durationMs);

  const vibrate = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    if (mode === 'target' && targetCount && currentCount >= targetCount && isRunning) {
      onToggle(); 
      vibrate([200, 100, 200, 100, 500]); 
    }
  }, [currentCount, targetCount, mode, isRunning, onToggle]);

  const lastVibratedCount = useRef(0);
  useEffect(() => {
    if (currentCount > 0 && currentCount % 33 === 0 && lastVibratedCount.current !== currentCount) {
      vibrate(50);
      lastVibratedCount.current = currentCount;
    }
  }, [currentCount]);


  const progress = mode === 'target' && targetCount 
    ? Math.min(100, (currentCount / targetCount) * 100)
    : 100;

  const isCompleted = mode === 'target' && targetCount && currentCount >= targetCount;

  if (isCompleted && !isRunning) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen p-6 animate-in fade-in zoom-in duration-500 text-center">
        <CheckCircle2 size={80} className="text-emerald-500 mb-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
        <h2 className="text-3xl font-bold text-white mb-2">{t(lang, 'targetReached')}</h2>
        <p className="text-slate-400 mb-10">
          {t(lang, 'targetMsg', { targetCount: targetCount || 0, name: dikr.name, time: Math.floor(elapsedTime / 1000) })}
        </p>
        <button
          onClick={onFinish}
          className="w-full max-w-xs py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
        >
          {t(lang, 'saveAndQuit')}
        </button>
      </div>
    );
  }

  const seconds = Math.floor((elapsedTime / 1000) % 60);
  const minutes = Math.floor(elapsedTime / 1000 / 60);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col items-center w-full min-h-screen max-w-md p-6 animate-in slide-in-from-right-4 duration-300">
      <header className="w-full flex items-center justify-between mb-12">
        <button onClick={onNavigateHome} className={`p-2 ${lang === 'ar' ? '-mr-2' : '-ml-2'} text-slate-400 hover:text-white transition-colors`}>
          <ArrowLeft size={24} className={lang === 'ar' ? 'rotate-180' : ''} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-semibold text-white">{dikr.name}</span>
          <span className="text-xs font-medium text-slate-400 tracking-wider">
            {mode === 'free' ? t(lang, 'freeMode') : `${t(lang, 'objAbbr')}: ${targetCount}`}
          </span>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex flex-col items-center flex-1 justify-center w-full">
        <div className="relative flex items-center justify-center w-64 h-64 mb-16">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="transparent" stroke="#1e293b" strokeWidth="4" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * progress) / 100}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
          
          <div className="flex flex-col items-center">
            <span className="text-7xl font-light tabular-nums text-white tracking-tighter">
              {currentCount}
            </span>
          </div>
        </div>

        <div className="text-3xl font-light text-slate-500 mb-12 tabular-nums">
          {formattedTime}
        </div>

        <div className="flex items-center gap-6" dir="ltr">
          <button
            onClick={() => {
              if (elapsedTime > 0 && !isRunning) {
                onFinish();
              } else {
                if (window.confirm(t(lang, 'cancelConfirm'))) {
                  onCancel();
                }
              }
            }}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-full transition-colors ${
              elapsedTime > 0 && !isRunning 
                ? 'bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400'
            }`}
          >
            {elapsedTime > 0 && !isRunning ? <Check size={24} /> : <XIcon size={24} />}
          </button>

          <button
            onClick={onToggle}
            className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            {isRunning ? <Pause size={36} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
          </button>
        </div>

        {/* Moteur de logs */}
        <div className="mt-8 w-full max-w-xs flex flex-col gap-2 relative">
          <div className="absolute left-[13px] top-4 bottom-4 w-px bg-slate-700/50" />
          {sessionEvents.map((evt, idx) => {
            const date = new Date(evt.time);
            const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            let label = "";
            let dotColor = "bg-blue-400";
            if (evt.action === 'start') { label = t(lang, 'sessionStart'); dotColor = "bg-emerald-400"; }
            else if (evt.action === 'pause') { label = t(lang, 'sessionPause'); dotColor = "bg-amber-400"; }
            else if (evt.action === 'resume') { label = t(lang, 'sessionResume'); dotColor = "bg-blue-400"; }
            
            return (
              <div key={idx} className="flex items-center gap-3 text-sm animate-in slide-in-from-bottom-2 fade-in relative z-10" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className={`w-3 h-3 rounded-full border-2 border-slate-900 ${dotColor} shadow-[0_0_10px_currentColor] opacity-80`} />
                <span className="text-slate-500 font-mono text-xs">{timeStr}</span>
                <span className="text-slate-300 font-medium">{label}</span>
              </div>
            );
          })}
        </div>
      </main>
      
      {isRunning && (
        <div className="fixed inset-0 pointer-events-none bg-black/40 mix-blend-multiply transition-opacity duration-1000" />
      )}
    </div>
  );
}
