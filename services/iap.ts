// iap.ts
import * as RNIap from 'react-native-iap';
import { Platform, Alert } from 'react-native';
import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useProfileTools } from '@/hooks/profilesTools';

// ─────────────────────────────────────────────────────────────
// SKU de l'abonnement
// ─────────────────────────────────────────────────────────────
const itemSkus = Platform.select({
  ios: ['premium1'],
  android: ['cinq_dodo_monthly'],
});

// ─────────────────────────────────────────────────────────────
// Initialisation de la connexion IAP
// ─────────────────────────────────────────────────────────────
export async function initIAP(): Promise<void> {
  try {
    const result = await RNIap.initConnection();
    if (!result) throw new Error('Échec de connexion IAP');
    await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
    console.log('✅ Connexion IAP établie');
  } catch (err) {
    console.error('❌ IAP init error:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// Récupération des offres d’abonnement
// ─────────────────────────────────────────────────────────────
export async function getSubscriptions() {
  try {
    if (!itemSkus) throw new Error('SKU non défini');
    const subs = await RNIap.getSubscriptions({ skus: itemSkus });
    return subs;
  } catch (err) {
    console.error('❌ getSubscriptions error:', err);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// Demande d’achat d’un abonnement
// ─────────────────────────────────────────────────────────────

export async function requestSubscription(): Promise<void> {
  try {
    if (!itemSkus || itemSkus.length === 0) throw new Error('SKU non défini');

    const subs = await getSubscriptions();
    if (!subs || subs.length === 0) throw new Error('Aucun abonnement disponible.');

    const selectedSub = subs[0];

    if (Platform.OS === 'android') {
      const androidSub = selectedSub as typeof selectedSub & {
        subscriptionOfferDetails?: {
          offerToken: string;
        }[];
      };

      const offerDetails = androidSub.subscriptionOfferDetails;
      if (!offerDetails || offerDetails.length === 0) {
        throw new Error("Aucune offre d'abonnement disponible pour ce produit.");
      }

      const offerToken = offerDetails[0].offerToken;
      if (!offerToken) throw new Error('Aucune offre disponible');

      await RNIap.requestSubscription({
        sku: itemSkus[0],
        subscriptionOffers: [
          {
            sku: itemSkus[0],
            offerToken,
          },
        ],
      });
    } else {
      await RNIap.requestSubscription({
        sku: itemSkus[0],
      });
    }

    console.log('✅ Demande d’abonnement envoyée');
  } catch (err) {
    console.error('❌ requestSubscription error:', err);
    Alert.alert('Erreur', (err as Error).message);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// Restauration des achats existants
// ─────────────────────────────────────────────────────────────
export async function getAvailablePurchases() {
  try {
    const purchases = await RNIap.getAvailablePurchases();
    console.log('🔍 Achats récupérés:', purchases);
    return purchases;
  } catch (err) {
    console.error('❌ getAvailablePurchases error:', err);
    return [];
  }
}

export async function restorePurchases() {
  const restored = await getAvailablePurchases();
  if (restored.length > 0) {
    Alert.alert('Succès', 'Vos achats ont été restaurés.');
  } else {
    Alert.alert('Info', 'Aucun achat à restaurer.');
  }
}

// ─────────────────────────────────────────────────────────────
// Vérification locale d’un abonnement actif
// ─────────────────────────────────────────────────────────────
export async function isSubscribed(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    const active = purchases.some((purchase) => {
      if ('originalTransactionDateIOS' in purchase) {
        return purchase.productId === itemSkus?.[0];
      }
      if ('purchaseStateAndroid' in purchase) {
        return (
          purchase.productId === itemSkus?.[0] &&
          purchase.purchaseStateAndroid === 1
        );
      }
      return false;
    });
    console.log('👑 Abonnement actif :', active);
    return active;
  } catch (err) {
    console.error('❌ isSubscribed check failed:', err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Écoute des achats terminés
// ─────────────────────────────────────────────────────────────
export function usePurchaseListener() {
  const { profile } = useProfileTools();

  useEffect(() => {
    const listener = RNIap.purchaseUpdatedListener(async (purchase) => {
      try {
        if (!profile?.user_id) {
          console.warn('⚠️ Aucun utilisateur connecté');
          return;
        }

        const token = purchase.purchaseToken;
        const productId = purchase.productId;

        if (!token || !productId) {
          console.warn('❌ Token ou produit manquant');
          return;
        }

        const { error } = await supabase.from('subscriptions').insert({
          user_id: profile.user_id,
          google_purchase_token: token,
          google_subscription_id: productId,
          platform: Platform.OS,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('❌ Supabase insert error:', error);
        } else {
          console.log('✅ Abonnement enregistré dans Supabase');
        }
      } catch (err) {
        console.error('❌ purchase listener error:', err);
      }
    });

    return () => {
      listener?.remove();
    };
  }, [profile?.user_id]);
}
