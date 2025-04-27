import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, Button, Platform } from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';

// IDs
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
const PROD_REWARDED_ID_ANDROID = 'ca-app-pub-9132892858077789/1596876441';
const PROD_REWARDED_ID_IOS = 'ca-app-pub-9132892858077789/6163904898';

const getRewardedAdUnitId = () => {
  if (__DEV__) return TEST_REWARDED_ID;
  return Platform.select({
    android: PROD_REWARDED_ID_ANDROID,
    ios: PROD_REWARDED_ID_IOS,
  })!;
};

type Props = {
  visible: boolean;
  onClose: (rewarded: boolean) => void;
};

export default function Rewarded({ visible, onClose }: Props) {
  const [adStarted, setAdStarted] = useState(false);
  const [ad, setAd] = useState<RewardedAd | null>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const rewarded = useRef(false);

  useEffect(() => {
    if (!visible) return;

    rewarded.current = false;
    const newAd = RewardedAd.createForAdRequest(getRewardedAdUnitId(), {
      requestNonPersonalizedAdsOnly: true,
    });

    setAd(newAd);
    setIsAdLoaded(false);
    newAd.load();
  }, [visible]);

  useEffect(() => {
    if (!ad) return;

    let fallbackTimeout: NodeJS.Timeout;

    const loadedListener = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsAdLoaded(true);
      if (adStarted) ad.show();
    });

    const rewardListener = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      rewarded.current = true;
    });

    const closeListener = ad.addAdEventListener(AdEventType.CLOSED, () => {
      onClose(rewarded.current);
    });

    const errorListener = ad.addAdEventListener(AdEventType.ERROR, () => {
      fallbackTimeout = setTimeout(() => {
        onClose(false);
      }, 500);
    });

    return () => {
      loadedListener();
      rewardListener();
      closeListener();
      errorListener();
      clearTimeout(fallbackTimeout);
    };
  }, [ad, adStarted]);

  const handleStartAd = () => {
    if (!ad) return;
    setAdStarted(true);
    if (isAdLoaded) ad.show();
  };

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
            <Button title="Non" color="gray" onPress={() => onClose(false)} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
