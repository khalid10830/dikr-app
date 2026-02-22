import type { DikrSession } from '../types';

export const getStatsByFilter = (history: DikrSession[], filterDate: 'today' | 'week' | 'all') => {
  let filtered = history.filter(session => session.mode !== 'calibration');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filterDate === 'today') {
    filtered = filtered.filter(session => session.date >= today.getTime());
  } else if (filterDate === 'week') {
    const day = today.getDay() || 7; 
    const monday = new Date(today);
    if (day !== 1) monday.setHours(-24 * (day - 1));
    filtered = filtered.filter(session => session.date >= monday.getTime());
  }

  const count = filtered.reduce((acc, curr) => acc + curr.count, 0);
  const timeMs = filtered.reduce((acc, curr) => acc + (curr.durationMs || 0), 0);
  const targetsReached = filtered.filter(s => s.mode === 'target' && s.target !== undefined && s.count >= s.target).length;

  return { count, timeMs, targetsReached };
};

export const getTodayCount = (history: DikrSession[]) => getStatsByFilter(history, 'today').count;
export const getWeekCount = (history: DikrSession[]) => getStatsByFilter(history, 'week').count;
export const getTotalCount = (history: DikrSession[]) => getStatsByFilter(history, 'all').count;

export const formatTime = (ms: number, lang: string): string => {
  const min = Math.floor(ms / 60000);
  if (min < 60) {
    return `${min} ${lang === 'ar' ? 'د' : 'min'}`;
  }
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} ${lang === 'ar' ? 'س' : 'h'} ${m} ${lang === 'ar' ? 'د' : 'min'}`;
};
