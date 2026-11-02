import { useEffect, useState } from 'react';
import { getTimeLeft } from '../lib/countdown.js';

/** Atualiza a cada segundo (alinhado ao relógio) e ao voltar para a aba. */
export function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timer;
    const tick = () => setNow(Date.now());
    const schedule = () => {
      timer = setTimeout(() => {
        tick();
        schedule();
      }, 1000 - (Date.now() % 1000) + 5);
    };
    const onVisible = () => {
      if (!document.hidden) tick();
    };
    tick();
    schedule();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return getTimeLeft(target, now);
}
