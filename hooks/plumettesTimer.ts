// hooks/plumettesTimer.ts
// - usePlumetteTimer : calcule dynamiquement le temps avant la prochaine recharge automatique de plumette (toutes les 24h)

import { useEffect, useState } from 'react';

export function usePlumetteTimer(lastRecharge: string | null) {
  const [nextPlumetteTimer, setNextPlumetteTimer] = useState('⏳ --:--');

  useEffect(() => {
    if (!lastRecharge) return;

    const interval = setInterval(() => {
      const last = new Date(lastRecharge);
      const next = new Date(last);
      next.setHours(next.getHours() + 24);

      const now = new Date();
      const diff = next.getTime() - now.getTime();

      if (diff <= 0) {
        setNextPlumetteTimer('00:00');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

        setNextPlumetteTimer(
          hours > 1
            ? `${String(hours).padStart(2, '0')}h:${minutes}m`
            : `${minutes}:${seconds}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastRecharge]);

  return nextPlumetteTimer;
}