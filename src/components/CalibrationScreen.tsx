import { useState } from 'react';
import { ArrowLeft, Play, Square, Check, RotateCcw } from 'lucide-react';
import type { DikrItem, Language } from '../types';
import { t } from '../i18n';

interface Props {
  lang: Language;
  dikr: DikrItem;
  elapsedTime: number;
  isRunning: boolean;
  onToggle: () => void;
  onRestart: () => void;
  onBack: () => void;
  onSave: (durationMs: number) => void;
  onFinish: () => void;
  onReset: () => void;
}

export function CalibrationScreen({ lang, dikr, elapsedTime, isRunning, onToggle, onRestart, onBack, onSave, onReset, onFinish }: Props) {
  const [attempts, setAttempts] = useState<number[]>([]);

  const getAllAttempts = () => attempts.length > 0 ? attempts : (elapsedTime > 500 ? [elapsedTime] : []);
  const allAttempts = getAllAttempts();
  const avg = allAttempts.length > 0 ? allAttempts.reduce((a, b) => a + b, 0) / allAttempts.length : 0;

  const handleSave = () => {
    if (allAttempts.length === 0) return;
    onSave(avg);
    onFinish();
  };

  const handleToggle = () => {
     if (isRunning) {
        // Stopping
        if (elapsedTime > 500) {
           setAttempts(prev => [...prev, elapsedTime]);
        }
        onToggle();
     } else if (!isRunning && elapsedTime > 0) {
        onRestart();
     } else {
        onToggle();
     }
  };

  const handleReset = () => {
     setAttempts([]);
     onReset();
  };

  return (
    <div className="flex flex-col items-center justify-between w-full min-h-screen max-w-md p-6 pb-12 animate-in slide-in-from-right-4 duration-300">
      <header className="w-full flex items-center justify-between">
        <button onClick={onBack} className={`p-2 ${lang === 'ar' ? '-mr-2' : '-ml-2'} text-slate-400 hover:text-white transition-colors`}>
          <ArrowLeft size={24} className={lang === 'ar' ? 'rotate-180' : ''} />
        </button>
        <span className="text-sm font-medium text-slate-300 uppercase tracking-wider">{t(lang, 'calibrationTitle')}</span>
        <div className="w-10" />
      </header>

      <main className="flex flex-col items-center w-full flex-1 justify-center mt-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">{dikr.name}</h2>
          <p className="text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">
            {t(lang, 'calibrationInstruct', { action: isRunning ? 'Stop' : 'Start' })} <b>{t(lang, 'calibrationOnce')}</b> {t(lang, 'calibrationEnd')} <b>Stop</b>.
          </p>
        </div>

        <div className="text-6xl font-light tabular-nums text-blue-400 mb-12" dir="ltr">
          {(elapsedTime / 1000).toFixed(2)}s
        </div>

        <div className="flex items-center gap-6" dir="ltr">
          <button
            onClick={handleReset}
            disabled={isRunning || (elapsedTime === 0 && attempts.length === 0)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
            title={elapsedTime === 0 && attempts.length > 0 ? t(lang, 'clearAttempts') as string : ''}
          >
            <RotateCcw size={20} />
          </button>

          <button
            onClick={handleToggle}
            className={`relative flex items-center justify-center w-24 h-24 rounded-full shadow-2xl transition-all duration-300 ${
              isRunning 
                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border-2 border-red-500' 
                : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95'
            }`}
          >
            {isRunning ? <Square size={36} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
          </button>
          
          <div className="w-14 h-14" />
        </div>

        {!isRunning && (attempts.length > 0 || elapsedTime > 0) && (
          <div className="mt-12 w-full animate-in fade-in zoom-in duration-300 flex flex-col items-center">
             {attempts.length > 0 && (
                <div className="flex gap-2 mb-6 flex-wrap justify-center max-w-[250px]">
                   {attempts.map((att, i) => (
                      <span key={i} className="bg-slate-800 text-slate-300 text-sm px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm" dir="ltr">
                         {(att / 1000).toFixed(2)}s
                      </span>
                   ))}
                </div>
             )}
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-900/20"
            >
              <Check size={20} />
              {attempts.length > 1 
                ? `${t(lang, 'saveAverage')} (${(avg / 1000).toFixed(2)}s)` 
                : t(lang, 'saveRythm')}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
