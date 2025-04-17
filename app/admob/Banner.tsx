import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
} from 'react-native-google-mobile-ads';

type BannerProps = {
  position?: 'top' | 'bottom';
  isSubscriber?: boolean;
};

// ✅ Ton ID AdMob réel
const PROD_BANNER_ID = 'ca-app-pub-9132892858077789/6299594703';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
const TEST_BANNER_ID = 'ca-app-pub-3940256099942544/6300978111';

export default function Banner({ position = 'bottom', isSubscriber = false }: BannerProps): JSX.Element {
  const [loaded, setLoaded] = useState(false);

  if (isSubscriber) return <></>;

  return (
    <View style={[styles.banner, position === 'top' ? styles.top : styles.bottom]}>
      {!loaded && (
        <View style={styles.fallback}>
          <Text style={styles.text}>
            🧪 Bannière ({position === 'top' ? 'haut' : 'bas'})
          </Text>
        </View>
      )}

      <BannerAd
        unitId={TEST_BANNER_ID}
        size={BannerAdSize.ADAPTIVE_BANNER}
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
};

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
  fallback: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  text: {
    color: '#333',
    fontSize: 14,
    fontStyle: 'italic',
  },
});
