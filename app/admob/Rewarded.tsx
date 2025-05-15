import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, Button, Platform } from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';

// ─────────────────────────────────────────────────────────────
// Ad Unit IDs
// ─────────────────────────────────────────────────────────────
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
const PROD_REWARDED_ID_ANDROID = 'ca-app-pub-9132892858077789/1596876441';
const PROD_REWARDED_ID_IOS = 'ca-app-pub-9132892858077789/6163904898';

const getRewardedAdUnitId = () =>
  __DEV__
    ? TEST_REWARDED_ID
    : Platform.select({
        android: PROD_REWARDED_ID_ANDROID,
        ios: PROD_REWARDED_ID_IOS,
      })!;

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  onClose: (rewarded: boolean) => void;
};

// ─────────────────────────────────────────────────────────────
// Rewarded Component
// ─────────────────────────────────────────────────────────────
export default function Rewarded({ visible, onClose }: Props) {
  const [adStarted, setAdStarted] = useState(false);
  const [ad, setAd] = useState<RewardedAd | null>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const rewarded = useRef(false);

  // Charge une nouvelle pub à chaque affichage
  useEffect(() => {
    if (!visible) return;

    rewarded.current = false;
    setIsAdLoaded(false);
    setAdStarted(false);

    const newAd = RewardedAd.createForAdRequest(getRewardedAdUnitId(), {
      requestNonPersonalizedAdsOnly: true,
    });

    setAd(newAd);
    newAd.load();
  }, [visible]);

  // Gestion des events liés à la pub
  useEffect(() => {
    if (!ad) return;

    let fallbackTimeout: NodeJS.Timeout | undefined;

    const onLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsAdLoaded(true);
    });

    const onReward = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      rewarded.current = true;
    });

    const onClose = ad.addAdEventListener(AdEventType.CLOSED, () => {
      propsOnClose();
    });

    const onError = ad.addAdEventListener(AdEventType.ERROR, () => {
      fallbackTimeout = setTimeout(() => {
        propsOnClose(false);
      }, 500);
    });

    return () => {
      onLoaded();
      onReward();
      onClose();
      onError();
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [ad]);

  // Lancement de la pub (au clic utilisateur uniquement)
  const handleStartAd = () => {
    if (!ad) return;
    setAdStarted(true);

    if (isAdLoaded) {
      ad.show();
    } else {
      const checkInterval = setInterval(() => {
        if (ad.loaded) {
          clearInterval(checkInterval);
          ad.show();
        }
      }, 400);
    }
  };

  const propsOnClose = (wasRewarded = rewarded.current) => {
    setAd(null);
    setIsAdLoaded(false);
    setAdStarted(false);
    onClose(wasRewarded);
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>🎁 Gagner une plumette</Text>
          <Text style={styles.message}>
            Souhaitez-vous regarder une courte vidéo publicitaire pour obtenir une plumette supplémentaire ?
          </Text>
          <View style={styles.buttons}>
            <Button title="Oui" onPress={handleStartAd} />
            <Button title="Non" color="gray" onPress={() => propsOnClose(false)} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b5b51',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 25,
  },
  buttons: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between',
  },
});
