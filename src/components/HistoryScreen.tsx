import { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, History, Target, Edit3, Plus, X } from 'lucide-react';
import type { DikrSession, DikrItem, Language } from '../types';
import { t } from '../i18n';
import { getStatsByFilter, formatTime } from '../utils/stats';

interface Props {
  lang: Language;
  history: DikrSession[];
  dikrs: DikrItem[];
  filterDikrId?: string;
  filterDikrName?: string;
  onBack: () => void;
  onClear: () => void;
  onDeleteSession: (id: string) => void;
  onEditDikr: (id: string, newName: string) => void;
  onDeleteDikr: (id: string) => void;
  onAddManualSession: (session: Omit<DikrSession, 'id'>) => void;
}

export function HistoryScreen({ lang, history, dikrs, filterDikrId, filterDikrName, onBack, onClear, onDeleteSession, onEditDikr, onDeleteDikr, onAddManualSession }: Props) {
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'prompt' | 'confirm';
    title: string;
    message?: string;
    onConfirm: (val?: string) => void;
  }>({ isOpen: false, type: 'confirm', title: '', onConfirm: () => {} });
  const [modalInput, setModalInput] = useState('');
  
  const calibratedDikrs = dikrs.filter(d => d.durationMs);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [manualEntryData, setManualEntryData] = useState({
    dikrId: filterDikrId || (calibratedDikrs.length > 0 ? calibratedDikrs[0].id : ''),
    count: '',
    date: '' 
  });

  useEffect(() => {
    if (isManualEntryOpen) {
      setManualEntryData({
        dikrId: filterDikrId || (calibratedDikrs.length > 0 ? calibratedDikrs[0].id : ''),
        count: '',
        date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      });
    }
  }, [isManualEntryOpen, filterDikrId, dikrs]);

  const displayHistory = filterDikrId 
    ? history.filter(s => s.dikrId === filterDikrId)
    : history;
    
  const sortedHistory = [...displayHistory].sort((a, b) => b.date - a.date);

  // Stats
  const stats = getStatsByFilter(displayHistory, 'all');

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat(lang, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      hourCycle: 'h23'
    }).format(new Date(timestamp));
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    if (minutes > 0) return `${minutes}m${seconds}s`;
    return `${seconds}s`;
  };

  const getModeLabel = (mode: string) => {
    if (mode === 'calibration') return t(lang, 'calibrationTitle');
    if (mode === 'target') return t(lang, 'targetMode');
    return t(lang, 'freeMode');
  };

  return (
    <div className="flex flex-col w-full max-w-md p-6 animate-in slide-in-from-right-4 duration-300 min-h-screen">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <button onClick={onBack} className={`p-2 ${lang === 'ar' ? '-mr-2' : '-ml-2'} text-slate-400 hover:text-white transition-colors`}>
          <ArrowLeft size={24} className={lang === 'ar' ? 'rotate-180' : ''} />
        </button>
        <h2 className="text-xl font-semibold text-white">
          {filterDikrName ? t(lang, 'journalDikrTitle', { name: filterDikrName }) : t(lang, 'journalTitle')}
        </h2>
        {filterDikrId ? (
          <div className="flex items-center gap-1">
            {dikrs.find(d => d.id === filterDikrId)?.durationMs && (
               <button
                  onClick={() => setIsManualEntryOpen(true)}
                  className="p-2 text-blue-500 hover:text-blue-400 transition-colors"
                  title={t(lang, 'addManualEntry') || "Ajout manuel"}
               >
                  <Plus size={20} />
               </button>
            )}
            <button 
              onClick={() => {
                setModalInput(filterDikrName || '');
                setModalConfig({
                  isOpen: true,
                  type: 'prompt',
                  title: t(lang, 'editDikrName') || "Renommer / Rename",
                  onConfirm: (val) => {
                    if (val && val.trim()) onEditDikr(filterDikrId, val.trim());
                  }
                });
              }}
              className="p-2 text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              <Edit3 size={20} />
            </button>
            <button 
              onClick={() => {
                setModalConfig({
                  isOpen: true,
                  type: 'confirm',
                  title: t(lang, 'delete') || "Supprimer",
                  message: t(lang, 'confirmDeleteDikr') || "Voulez-vous vraiment supprimer cet élément ?",
                  onConfirm: () => onDeleteDikr(filterDikrId)
                });
              }}
              className={`p-2 ${lang === 'ar' ? '-ml-2' : '-mr-2'} text-red-500 hover:text-red-400 transition-colors`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ) : displayHistory.length > 0 ? (
          <div className="flex items-center gap-1">
            <button
               onClick={() => setIsManualEntryOpen(true)}
               className="p-2 text-blue-500 hover:text-blue-400 transition-colors"
               title={t(lang, 'addManualEntry') || "Ajout manuel"}
            >
               <Plus size={20} />
            </button>
            <button 
              onClick={() => {
                setModalConfig({
                  isOpen: true,
                  type: 'confirm',
                  title: t(lang, 'clearHistoryLabel') || 'Vider l\'historique',
                  message: t(lang, 'clearHistoryPrompt'),
                  onConfirm: () => onClear()
                });
              }}
              className={`p-2 ${lang === 'ar' ? '-ml-2' : '-mr-2'} text-red-500 hover:text-red-400 transition-colors`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
               onClick={() => setIsManualEntryOpen(true)}
               className={`p-2 ${lang === 'ar' ? '-ml-2' : '-mr-2'} text-blue-500 hover:text-blue-400 transition-colors`}
               title={t(lang, 'addManualEntry') || "Ajout manuel"}
            >
               <Plus size={20} />
            </button>
          </div>
        )}
      </header>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-slate-800/80 rounded-xl p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider line-clamp-1">{t(lang, 'dikrs')}</span>
          <span className="text-xl font-bold text-white">{stats.count}</span>
        </div>
        <div className="bg-emerald-900/20 rounded-xl p-3 flex flex-col items-center justify-center text-center ring-1 ring-emerald-500/20">
          <span className="text-[10px] text-emerald-400/80 mb-1 uppercase tracking-wider line-clamp-1 flex items-center justify-center"><Target size={10} className="mr-1 inline" />{t(lang, 'targetsReached')}</span>
          <span className="text-xl font-bold text-emerald-100">{stats.targetsReached}</span>
        </div>
        <div className="bg-amber-900/20 rounded-xl p-3 flex flex-col items-center justify-center text-center ring-1 ring-amber-500/20">
          <span className="text-[10px] text-amber-400/80 mb-1 uppercase tracking-wider line-clamp-1">{t(lang, 'timeSpent')}</span>
          <span className="text-xl font-bold text-amber-100">{formatTime(stats.timeMs, lang)}</span>
        </div>
      </div>

      {displayHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-500 gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
            <History size={24} />
          </div>
          <p>{t(lang, 'emptyJournal')}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 pb-8">
          {sortedHistory.map((session) => (
            <li 
              key={session.id} 
              className={`bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex gap-4 transition-all hover:bg-slate-800/60 ${session.mode === 'calibration' ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-xl px-4 py-2 min-w-[80px]">
                {session.mode === 'calibration' ? (
                  <span className="text-sm font-semibold text-blue-400">{t(lang, 'calibrated')}</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-white leading-none">{session.count}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase mt-1">{t(lang, 'dikrs')}</span>
                  </>
                )}
              </div>
              
              <div className="flex flex-col flex-1 justify-center gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-medium line-clamp-1">
                    {session.dikrName}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(session.date)}</span>
                    <button 
                      onClick={() => {
                        setModalConfig({
                          isOpen: true,
                          type: 'confirm',
                          title: t(lang, 'delete') || 'Supprimer',
                          message: t(lang, 'confirmDeleteSession') || "Voulez-vous supprimer cette session ?",
                          onConfirm: () => onDeleteSession(session.id)
                        });
                      }}
                      className="text-slate-500 hover:text-red-400 transition-colors p-2 -m-2"
                      title={t(lang, 'delete') || 'Supprimer'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="bg-slate-800 px-2 py-0.5 rounded-md">
                    {getModeLabel(session.mode)}
                  </span>
                  <span>•</span>
                  <span>{formatDuration(session.durationMs)}</span>
                  {session.mode === 'target' && session.target && (
                    <>
                      <span>•</span>
                      <span>{t(lang, 'objAbbr')}: {session.target}</span>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Custom Global Modals (Prompt / Confirm) */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
          <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl z-10 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="p-6 flex flex-col gap-4 text-center">
              <h3 className="text-xl font-semibold text-white">{modalConfig.title}</h3>
              {modalConfig.message && <p className="text-slate-400 text-sm leading-relaxed">{modalConfig.message}</p>}
              
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
                className={`flex-1 py-4 font-medium focus:outline-none transition-colors ${
                  modalConfig.type === 'confirm' 
                    ? 'text-red-500 hover:text-red-400 hover:bg-slate-700/50' 
                    : 'text-blue-400 hover:text-blue-300 hover:bg-slate-700/50'
                }`}
              >
                {modalConfig.type === 'confirm' ? (t(lang, 'delete') || 'Supprimer') : (t(lang, 'saveBtn') || 'Enregistrer')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isManualEntryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsManualEntryOpen(false)} />
          <div className="bg-slate-800 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl z-10 flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <header className="flex items-center justify-between p-4 border-b border-slate-700">
               <h3 className="text-lg font-semibold text-white">{t(lang, 'manualEntryTitle') || "Ajout manuel"}</h3>
               <button onClick={() => setIsManualEntryOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </header>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const dikr = dikrs.find(d => d.id === manualEntryData.dikrId);
              if (!dikr || !manualEntryData.count) return;
              
              onAddManualSession({
                dikrId: dikr.id,
                dikrName: dikr.name,
                count: parseInt(manualEntryData.count, 10),
                durationMs: (dikr.durationMs || 1000) * parseInt(manualEntryData.count, 10),
                date: new Date(manualEntryData.date).getTime(),
                mode: 'free'
              });
              setIsManualEntryOpen(false);
            }} className="p-4 flex flex-col gap-4">
              
              {!filterDikrId && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-slate-400">{t(lang, 'dikrLabel') || "Dikr"}</label>
                  <select 
                    required
                    value={manualEntryData.dikrId}
                    onChange={e => setManualEntryData(prev => ({...prev, dikrId: e.target.value}))}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>{t(lang, 'selectDikr') || "Sélectionner / Select"}</option>
                    {calibratedDikrs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-slate-400">{t(lang, 'countLabel') || "Nombre / Count"}</label>
                <input 
                  type="number" required min="1"
                  value={manualEntryData.count}
                  onChange={e => setManualEntryData(prev => ({...prev, count: e.target.value}))}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-slate-400">{t(lang, 'dateLabel') || "Date"}</label>
                <input 
                  type="datetime-local" required
                  value={manualEntryData.date}
                  onChange={e => setManualEntryData(prev => ({...prev, date: e.target.value}))}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                />
              </div>

              <button type="submit" className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors">
                {t(lang, 'addBtn') || "Ajouter"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
