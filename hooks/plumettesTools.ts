// hooks/plumettesTools.ts
// - usePlumetteTools : hook principal pour gérer les plumettes depuis un profil utilisateur donné.
// - usePlumetteTimer : calcule dynamiquement le temps avant la prochaine recharge automatique.

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import {
  checkAndDecrementPlumette,
  isSubscriber,
} from '@/services/supabase';

/**
 * ⏱ Calcule dynamiquement le temps avant la prochaine recharge de plumette (24h après la dernière).
 */
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

/**
 * 🪶 Hook principal pour la gestion des plumettes.
 */
export function usePlumetteTools({
  profile,
  onRefresh,
}: {
  profile: {
    current_period_end?: string | null;
    last_plumette_recharge?: string | null;
  };
  onRefresh: () => void;
}) {
  const nextPlumetteTimer = usePlumetteTimer(profile?.last_plumette_recharge ?? null);
  const userIsSubscriber = isSubscriber(profile?.current_period_end);

  /**
   * ✅ Vérifie si l'utilisateur a une plumette, sinon propose pub ou abonnement.
   */
  async function checkPlumetteWithAlert(
    openRewarded: () => Promise<boolean>
  ): Promise<boolean> {
    const allowed = await checkAndDecrementPlumette();
    if (allowed === true) {
      await onRefresh();
      return true;
    }
  
    return new Promise<boolean>((resolve) => {
      Alert.alert(
        'Plus de plumettes',
        'Tu n’as plus de plumettes. Tu peux t’abonner pour en avoir en illimité ou regarder une pub pour en gagner une.',
        [
          {
            text: '📺 Regarder une pub',
            onPress: async () => {
              const watched = await openRewarded();
              if (watched) {
                await onRefresh();
                resolve(true);
              } else {
                resolve(false);
              }
            },
          },
          {
            text: '⭐ S’abonner',
            onPress: () => {
              router.push('/offres');
              resolve(false);
            },
          },
          {
            text: 'Annuler',
            style: 'cancel',
            onPress: () => resolve(false),
          },
        ]
      );
    });
  }
  

  return {
    nextPlumetteTimer,
    checkPlumetteWithAlert,
  };
}
