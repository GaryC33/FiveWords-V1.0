import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';

type BannerProps = {
  position?: 'top' | 'bottom';
  isSubscriber?: boolean;
};

// ✅ IDs de production
const PROD_BANNER_ID_ANDROID = 'ca-app-pub-9132892858077789/6299594703';
const PROD_BANNER_ID_IOS = 'ca-app-pub-9132892858077789/5372200426';

// ✅ ID de test universel
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

// ✅ Sélection dynamique selon l’environnement et la plateforme
const getBannerAdUnitId = () => {
  if (__DEV__) return TEST_BANNER_ID;

  return Platform.select({
    android: PROD_BANNER_ID_ANDROID,
    ios: PROD_BANNER_ID_IOS,
  })!;
};

export default function Banner({ position = 'bottom', isSubscriber = false }: BannerProps): JSX.Element | null {
  const [loaded, setLoaded] = useState(false);

  if (isSubscriber) return null;

  return (
    <View style={[styles.banner, position === 'top' ? styles.top : styles.bottom]}>
      <BannerAd
        unitId={getBannerAdUnitId()}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={(e) => {
          console.log('❌ Ad failed to load:', e);
          setLoaded(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 10,
  },
  top: {
    position: 'absolute',
    top: 0,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
  },
});
