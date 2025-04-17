// ─────────────────────────────────────────────────────────────
// Services liés à la création de paiements Stripe (abonnement / livre)
// Utilise Supabase Edge Function : create-payment-intent
// ─────────────────────────────────────────────────────────────

// Chargement des variables d’environnement
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SUBSCRIPTION_PRICE_ID = process.env.EXPO_PUBLIC_SUBSCRIPTION_PRICE_ID;
const BOOK_PRICE_ID = process.env.EXPO_PUBLIC_BOOK_PRICE_ID;

// Sécurité : vérification des variables critiques
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('❌ Configuration Supabase manquante.');
}

if (!SUBSCRIPTION_PRICE_ID || !BOOK_PRICE_ID) {
  throw new Error('❌ Identifiants Stripe (Price IDs) manquants.');
}

// ─────────────────────────────────────────────────────────────
// Crée un paiement Stripe pour un abonnement
// ─────────────────────────────────────────────────────────────

export const createSubscription = async (email: string) => {
  try {
    console.log('▶️ Création d’un abonnement pour :', email);
    console.log('▶️ Utilisation du price ID :', SUBSCRIPTION_PRICE_ID);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        type: 'subscription',
        priceId: SUBSCRIPTION_PRICE_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Échec de la création de l’abonnement :', errorText);
      throw new Error(`Erreur serveur Stripe : ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Abonnement Stripe créé :', data);
    return data;
  } catch (error) {
    console.error('❌ Exception Stripe (abonnement) :', error);
    throw new Error(
      error instanceof Error ? error.message : 'Erreur inconnue création abonnement'
    );
  }
};

// ─────────────────────────────────────────────────────────────
// Crée un paiement Stripe pour commander un livre
// ─────────────────────────────────────────────────────────────

export const createBookOrder = async (email: string) => {
  try {
    console.log('▶️ Création d’une commande de livre pour :', email);
    console.log('▶️ Utilisation du price ID :', BOOK_PRICE_ID);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        type: 'book',
        priceId: BOOK_PRICE_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Échec de la commande de livre :', errorText);
      throw new Error(`Erreur serveur Stripe : ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Commande de livre Stripe créée :', data);
    return data;
  } catch (error) {
    console.error('❌ Exception Stripe (livre) :', error);
    throw new Error(
      error instanceof Error ? error.message : 'Erreur inconnue commande livre'
    );
  }
};
