import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

// Remplace par ton SKU réel (Play Console / App Store Connect)
const itemSkus = Platform.select({
  ios: ['cinq_dodo_monthly'],
  android: ['cinq_dodo_monthly'],
});

export async function initIAP(): Promise<void> {
  try {
    const result = await RNIap.initConnection();
    if (!result) throw new Error('Échec de la connexion IAP');
    await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
  } catch (err) {
    console.error('❌ IAP init error:', err);
  }
}

export async function getSubscriptions() {
  try {
    const subs = await RNIap.getSubscriptions({ skus: itemSkus! });
    return subs;
  } catch (err) {
    console.error('❌ getSubscriptions error:', err);
    return [];
  }
}

export async function requestSubscription(): Promise<void> {
  try {
    if (!itemSkus || itemSkus.length === 0) throw new Error('SKU non défini');
    await RNIap.requestSubscription({ sku: itemSkus[0] });
  } catch (err) {
    console.error('❌ requestSubscription error:', err);
  }
}

export async function getAvailablePurchases() {
  try {
    const purchases = await RNIap.getAvailablePurchases();
    return purchases;
  } catch (err) {
    console.error('❌ getAvailablePurchases error:', err);
    return [];
  }
}

export async function isSubscribed(): Promise<boolean> {
  try {
    const purchases = await getAvailablePurchases();
    const active = purchases.some(purchase => {
      // iOS
      if ('originalTransactionDateIOS' in purchase) {
        return purchase.productId === itemSkus?.[0];
      }
      // Android
      if ('purchaseStateAndroid' in purchase) {
        return purchase.productId === itemSkus?.[0] && purchase.purchaseStateAndroid === 1;
      }
      return false;
    });

    return active;
  } catch (err) {
    console.error('❌ isSubscribed check failed:', err);
    return false;
  }
}
