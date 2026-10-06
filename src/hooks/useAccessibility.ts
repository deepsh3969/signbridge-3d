import { useEffect } from 'react';
import { useSettings } from '@/store/settings';

/**
 * Mirrors the accessibility settings onto <html> so CSS can react to them,
 * and keeps the document metadata (colour scheme, font scale) in sync.
 */
export function useApplySettings() {
  const fontSize = useSettings((s) => s.fontSize);
  const darkMode = useSettings((s) => s.darkMode);
  const highContrast = useSettings((s) => s.highContrast);
  const reducedMotion = useSettings((s) => s.reducedMotion);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fontSize = fontSize;
    root.classList.toggle('dark', darkMode);
    root.classList.toggle('contrast-high', highContrast);
    root.classList.toggle('motion-reduced', reducedMotion);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', darkMode ? '#0b1220' : '#f6f7fb');
  }, [fontSize, darkMode, highContrast, reducedMotion]);
}

/** Detect the OS-level reduced-motion preference. */
export function usePrefersReducedMotion(): boolean {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => useSettings.getState().patch({ reducedMotion: mq.matches });
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return useSettings((s) => s.reducedMotion);
}
