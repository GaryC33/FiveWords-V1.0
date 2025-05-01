import { useEffect } from 'react';
import { Alert } from 'react-native';
import { Ump, DebugGeography } from 'google-ump-react-native';

export function useConsentManager() {
  useEffect(() => {
    const loadConsent = async () => {
      try {
        // 1. Demande des infos de consentement (avec debugSettings uniquement)
        await Ump.requestInfoUpdate({
          debugSettings: {
            debugGeography: DebugGeography.EEA,            // Force l'Europe pour le test
            testDeviceIdentifiers: ['TEST_DEVICE_ID'],      // Remplace par ton ID de test
          },
        });

        // 2. Vérifie si on peut demander des pubs personnalisées
        const { canRequestAds } = Ump.getConsentInformation();

        if (canRequestAds) {
          // 3. Charge et affiche le formulaire si besoin
          const result = await Ump.loadAndShowConsentFormIfRequired();
          if (result.canRequestAds) {
            // initializeMobileAdsSdk();
          }
        }
      } catch (e: any) {
        Alert.alert('Consent Error', e.message || String(e));
      }
    };

    loadConsent();
  }, []);
}
