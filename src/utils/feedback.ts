import type { Language } from '../types';
import { t } from '../i18n';

export const playTargetReachedSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    const now = ctx.currentTime;
    
    osc.frequency.setValueAtTime(1046.50, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
    gain.gain.linearRampToValueAtTime(0, now + 0.15);
    
    osc.frequency.setValueAtTime(1318.51, now + 0.2);
    gain.gain.setValueAtTime(0, now + 0.2);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.25);
    gain.gain.linearRampToValueAtTime(0, now + 0.4);
    
    osc.start(now);
    osc.stop(now + 0.5);
  } catch (e) {
    console.warn('Audio play failed', e);
  }
};

export const triggerVibration = (pattern: number | number[]) => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration failed', e);
    }
  }
};

export const triggerTargetReachedFeedback = (lang: Language, dikrName: string, targetCount: number, elapsedTime: number) => {
  // A robust vibration pattern for Android
  triggerVibration([500, 200, 500, 200, 1000]); 
  playTargetReachedSound();
  
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    const title = t(lang, 'targetReached');
    const options = {
      body: t(lang, 'targetMsg', { targetCount, name: dikrName, time: Math.floor(elapsedTime / 1000) }),
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [500, 200, 500, 200, 1000],
    };
    
    if (navigator.serviceWorker) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      }).catch(() => {
        try { new Notification(title, options); } catch (e) {}
      });
    } else {
      try { new Notification(title, options); } catch (e) {}
    }
  }
};
