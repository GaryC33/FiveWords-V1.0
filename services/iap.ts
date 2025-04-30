// services/iap.ts
import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

// SKU de l'abonnement
const itemSkus = Platform.select({
  ios: ['6745134783'],    // Remplace par ton ID App Store Connect
  android: ['cinq_dodo_monthly'], // Remplace par ton ID Google Play Console
});

// Initialiser la connexion IAP
export async function initIAP(): Promise<void> {
  try {
    const result = await RNIap.initConnection();
    if (!result) throw new Error('Échec de connexion IAP');
    await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
    console.log('✅ IAP connexion établie');
  } catch (err) {
    console.error('❌ IAP init error:', err);
  }
}

// Récupérer les informations de l'abonnement (prix, durée, etc.)
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

// Demander l'achat de l'abonnement
export async function requestSubscription(): Promise<void> {
  try {
    if (!itemSkus || itemSkus.length === 0) throw new Error('SKU non défini');

    const subs = await RNIap.getSubscriptions({ skus: itemSkus });
    console.log('📦 Abonnements disponibles :', subs);

    if (!subs.length || !('subscriptionOfferDetails' in subs[0]) || !subs[0].subscriptionOfferDetails?.length) {
      throw new Error('Aucune offre d’abonnement disponible.');
    }

    const offerToken = subs[0].subscriptionOfferDetails[0].offerToken;

    await RNIap.requestSubscription({
      sku: itemSkus[0],
      subscriptionOffers: [
        {
          sku: itemSkus[0],
          offerToken,
        },
      ],
    });

    console.log('✅ Demande d’abonnement envoyée avec offerToken');

  } catch (err) {
    console.error('❌ requestSubscription error:', err);
    throw err;
  }
}
// Vérifier les achats disponibles (ex: après login)
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

// Vérifier si l'utilisateur est abonné
export async function isSubscribed(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    const active = purchases.some((purchase) => {
      if ('originalTransactionDateIOS' in purchase) {
        // iOS
        return purchase.productId === itemSkus?.[0];
      }
      if ('purchaseStateAndroid' in purchase) {
        // Android
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
