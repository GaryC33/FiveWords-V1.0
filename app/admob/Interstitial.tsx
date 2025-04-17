import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

const INTERSTITIAL_UNIT_ID = 'ca-app-pub-9132892858077789/4964727079';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

export default function Interstitial({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [fallback, setFallback] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const adRef = useRef(
    InterstitialAd.createForAdRequest(TEST_INTERSTITIAL_ID, {
      requestNonPersonalizedAdsOnly: true,
    })
  ).current;

  useEffect(() => {
    if (!visible) return;

    const loadAndShowAd = () => {
      adRef.load();

      const loadedListener = adRef.addAdEventListener(AdEventType.LOADED, () => {
        adRef.show();
      });

      const closedListener = adRef.addAdEventListener(AdEventType.CLOSED, () => {
        onClose();
      });

      const errorListener = adRef.addAdEventListener(AdEventType.ERROR, () => {
        // Retirer le timeout, déclencher directement le fallback
        setFallback(true);
      });

      return () => {
        loadedListener();
        closedListener();
        errorListener();
      };
    };

    const unsubscribe = loadAndShowAd();
    return unsubscribe;
  }, [visible]);

  // Fallback : countdown
  useEffect(() => {
    if (!fallback || !visible) return;

    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          // Important : éviter setState during render
          setTimeout(() => onClose(), 0);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fallback, visible]);

  if (!visible || (!fallback && Platform.OS !== 'android')) return null;

  return (
    fallback && (
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>✨ Une histoire magique se prépare...</Text>
          <Text style={styles.timer}>
            Encore {countdown} seconde{countdown > 1 ? 's' : ''}...
          </Text>
        </View>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    backgroundColor: '#fff8ef',
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    maxWidth: '80%',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#4a3f35',
    marginBottom: 12,
    textAlign: 'center',
  },
  timer: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
    color: '#6b5b51',
  },
});
