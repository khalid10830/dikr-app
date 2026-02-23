import { useState, useEffect } from 'react';
import type { Screen, SessionMode, DikrSession, DikrItem, Language, SessionEvent } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { CalibrationScreen } from './components/CalibrationScreen';
import { SessionScreen } from './components/SessionScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { Analytics } from '@vercel/analytics/react';
import { t } from './i18n';

// Default Dikrs (empty if they want to choose themselves, or minimal)
const baseDikrs: DikrItem[] = [];

function App() {
  // --- PERSISTENT STATE ---
  const [hasSeenOnboarding, setHasSeenOnboarding] = useLocalStorage<boolean>('has-seen-onboarding', false);
  const [dikrs, setDikrs] = useLocalStorage<DikrItem[]>('dikr-list', baseDikrs);
  const [history, setHistory] = useLocalStorage<DikrSession[]>('dikr-history', []);
  const [lang, setLang] = useLocalStorage<Language>('app-lang', 'fr');

  useEffect(() => {
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // --- NAVIGATION STATE ---
  const [currentScreen, setCurrentScreen] = useState<Screen>(hasSeenOnboarding ? 'home' : 'onboarding');
  const [isOnboardingFromHome, setIsOnboardingFromHome] = useState(false);
  const [selectedDikrId, setSelectedDikrId] = useState<string | null>(null);
  const [sessionMode, setSessionMode] = useState<SessionMode>('free');
  const [targetCount, setTargetCount] = useState<number | undefined>(undefined);
  const [historyFilterId, setHistoryFilterId] = useState<string | undefined>(undefined);

  // --- GLOBAL TIMER STATE (Lifting State Up) ---
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([]);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isTimerRunning, startTime]);

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setSessionEvents(prev => [...prev, { time: Date.now(), action: 'pause' }]);
    } else {
      setStartTime(Date.now() - elapsedTime);
      setIsTimerRunning(true);
      if (elapsedTime > 0) {
        setSessionEvents(prev => [...prev, { time: Date.now(), action: 'resume' }]);
      }
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setElapsedTime(0);
  };

  const currentDikr = dikrs.find(d => d.id === selectedDikrId) || null;

  // --- HANDLERS ---
  const handleCompleteOnboarding = () => {
    setHasSeenOnboarding(true);
    setIsOnboardingFromHome(false);
    setCurrentScreen('home');
  };

  const handleAddDikr = (name: string) => {
    const newDikr: DikrItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      name,
      durationMs: null
    };
    setDikrs([newDikr, ...dikrs]);
  };

  const handleDeleteDikr = (id: string) => {
    setDikrs(dikrs.filter(d => d.id !== id));
    // Optionnel : on pourrait aussi supprimer l'historique associé, mais la suppression du dikr suffit souvent.
  };

  const handleEditDikr = (id: string, newName: string) => {
    setDikrs(dikrs.map(d => d.id === id ? { ...d, name: newName } : d));
    setHistory(history.map(h => h.dikrId === id ? { ...h, dikrName: newName } : h));
  };

  const handleSaveCalibration = (duration: number) => {
    if (!currentDikr) return;
    
    setDikrs(dikrs.map(d => d.id === currentDikr.id ? { ...d, durationMs: duration } : d));
    
    const log: DikrSession = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      dikrId: currentDikr.id,
      dikrName: currentDikr.name,
      count: 1, 
      durationMs: duration,
      mode: 'calibration',
      date: Date.now()
    };
    setHistory([log, ...history]);
  };

  const handleFinishSession = (shouldSave: boolean) => {
    if (shouldSave && currentDikr && currentDikr.durationMs) {
      const count = Math.floor(elapsedTime / currentDikr.durationMs);
      if (count > 0 || sessionMode === 'calibration') {
         const newSession: DikrSession = {
           id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
           dikrId: currentDikr.id,
           dikrName: currentDikr.name,
           date: Date.now(),
           durationMs: elapsedTime,
           count: count,
           mode: sessionMode,
           target: targetCount
         };
         setHistory([newSession, ...history]);
      }
    }
    resetTimer();
    setSelectedDikrId(null);
    setCurrentScreen('home');
  };

  const startSession = (dikrId: string, mode: SessionMode, target?: number) => {
    if (isTimerRunning || elapsedTime > 0) {
      if (!window.confirm(t(lang, 'replaceSessionPrompt'))) {
        return;
      }
    }
    resetTimer();
    setSelectedDikrId(dikrId);
    setSessionMode(mode);
    setTargetCount(target);
    setSessionEvents([{ time: Date.now(), action: 'start' }]);
    setCurrentScreen(mode === 'calibration' ? 'calibration' : 'session');
  };

  const isSessionActive = elapsedTime > 0;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-slate-900 text-slate-50 w-full overflow-hidden relative font-sans">
      <Analytics />
      
      {isSessionActive && currentScreen !== 'session' && currentScreen !== 'calibration' && currentScreen !== 'onboarding' && (
        <button 
          onClick={() => setCurrentScreen(sessionMode === 'calibration' ? 'calibration' : 'session')}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-full shadow-2xl flex items-center justify-center gap-3 text-sm font-semibold animate-bounce"
        >
          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
          {t(lang, 'sessionOngoing')}
        </button>
      )}

      {currentScreen === 'onboarding' && (
        <OnboardingScreen
          lang={lang}
          onChangeLang={setLang}
          onFinish={handleCompleteOnboarding}
          fromHomeScreen={isOnboardingFromHome}
        />
      )}

      {currentScreen === 'home' && (
        <HomeScreen 
          lang={lang}
          onChangeLang={setLang}
          history={history}
          dikrs={dikrs}
          onAddDikr={handleAddDikr}
          onDeleteDikr={handleDeleteDikr}
          onEditDikr={handleEditDikr}
          onStartSession={startSession}
          onNavigate={(s) => setCurrentScreen(s)}
          onViewHistory={(id) => {
            setHistoryFilterId(id);
            setCurrentScreen('history');
          }}
          onShowOnboarding={() => {
            setIsOnboardingFromHome(true);
            setCurrentScreen('onboarding');
          }}
        />
      )}

      {currentScreen === 'calibration' && currentDikr && (
        <CalibrationScreen 
          lang={lang}
          dikr={currentDikr}
          elapsedTime={elapsedTime}
          isRunning={isTimerRunning}
          onToggle={toggleTimer}
          onBack={() => setCurrentScreen('home')}
          onSave={handleSaveCalibration}
          onFinish={() => handleFinishSession(false)} 
          onReset={resetTimer}
        />
      )}

      {currentScreen === 'session' && currentDikr && currentDikr.durationMs && (
        <SessionScreen 
          lang={lang}
          dikr={currentDikr}
          mode={sessionMode}
          targetCount={targetCount}
          
          elapsedTime={elapsedTime}
          isRunning={isTimerRunning}
          sessionEvents={sessionEvents}
          onToggle={toggleTimer}
          
          onCancel={() => handleFinishSession(false)}
          onFinish={() => handleFinishSession(true)}
          
          onNavigateHome={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'history' && (
        <HistoryScreen 
          lang={lang}
          history={history}
          filterDikrId={historyFilterId}
          filterDikrName={historyFilterId ? dikrs.find(d => d.id === historyFilterId)?.name : undefined}
          onBack={() => setCurrentScreen('home')}
          onClear={() => {
            if (window.confirm(t(lang, 'clearHistoryPrompt'))) {
              setHistory(historyFilterId ? history.filter(h => h.dikrId !== historyFilterId) : []);
            }
          }}
          onDeleteSession={(sid) => {
            if (window.confirm("Delete ?")) {
              setHistory(history.filter(s => s.id !== sid));
            }
          }}
          onEditDikr={(id, newName) => handleEditDikr(id, newName)}
          onDeleteDikr={(id) => {
            handleDeleteDikr(id);
            setCurrentScreen('home');
          }}
        />
      )}
    </div>
  );
}

export default App;
