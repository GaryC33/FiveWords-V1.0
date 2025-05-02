import { useEffect } from 'react';
import { Alert } from 'react-native';
import { Ump } from 'google-ump-react-native';
import mobileAds from 'react-native-google-mobile-ads';

export function useConsentManager() {
  useEffect(() => {
    const run = async () => {
      try {
        await Ump.requestInfoUpdate(); // Récupère les infos de consentement

        const result = await Ump.loadAndShowConsentFormIfRequired();

        if (result.canRequestAds) {
          await mobileAds().initialize();
          console.log('✅ Mobile Ads SDK initialized');
        }
      } catch (e: any) {
        Alert.alert('Consent error', e.message || String(e));
      }
    };

    run();
  }, []);
}
