import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { supabase } from '@/services/supabase';
import { useProfileTools } from '@/hooks/profilesTools';

// ─────────────────────────────────────────────────────────────
// SKU de l'abonnement (à personnaliser selon ton store)
// ─────────────────────────────────────────────────────────────
const itemSkus = Platform.select({
  ios: ['6745134783'],            // ID App Store Connect
  android: ['cinq_dodo_monthly'], // ID Google Play Console
});

// ─────────────────────────────────────────────────────────────
// Connexion IAP
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
// Récupérer les offres d’abonnement
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
// Demander l’achat d’un abonnement
// ─────────────────────────────────────────────────────────────
export async function requestSubscription(): Promise<void> {
  try {
    if (!itemSkus || itemSkus.length === 0) throw new Error('SKU non défini');

    const subs = await RNIap.getSubscriptions({ skus: itemSkus });
    console.log('📦 Abonnements disponibles :', subs);

    const offerToken = subs?.[0]?.subscriptionOfferDetails?.[0]?.offerToken;
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

    console.log('✅ Demande d’abonnement envoyée');
  } catch (err) {
    console.error('❌ requestSubscription error:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────
// Vérifier les achats existants (ex: au login)
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

// ─────────────────────────────────────────────────────────────
// Vérifie si l’utilisateur est abonné localement (mobile)
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
// Écoute les achats terminés et les enregistre dans Supabase
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
          platform: 'google',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('❌ Supabase insert error:', error);
        } else {
          console.log('✅ Abonnement Google enregistré dans Supabase');
        }
      } catch (err) {
        console.error('❌ purchase listener error:', err);
      }
    });

    return () => {
      if (listener) listener.remove();
    };
  }, [profile?.user_id]);
}
