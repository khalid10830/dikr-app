export type Screen = 'onboarding' | 'home' | 'calibration' | 'session' | 'history';
export type SessionMode = 'free' | 'target' | 'calibration';
export type Language = 'fr' | 'en' | 'ar';

export interface DikrItem {
  id: string;
  name: string;
  durationMs: number | null; // null if not yet calibrated
}

export interface DikrSession {
  id: string;
  dikrId: string;
  dikrName: string;
  date: number; // timestamp
  durationMs: number;
  count: number;
  mode: SessionMode;
  target?: number;
}

export interface AppState {
  dikrs: DikrItem[];
  history: DikrSession[];
}

export interface SessionEvent {
  time: number; // timestamp
  action: 'start' | 'pause' | 'resume';
}
