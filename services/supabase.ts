// ─────────────────────────────────────────────────────────────
// Connexion Supabase et fonctions liées à l'utilisateur
// ─────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import { morales, moraleCategories, stylesEnfants, stylesEnfantsCategories } from '@/constants/story';

// ─────────────────────────────────────────────────────────────
// Initialisation Supabase
// ─────────────────────────────────────────────────────────────

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Supabase URL ou clé manquante dans le .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    },
  },
});

// ─────────────────────────────────────────────────────────────
// Déconnexion manuelle (utile pour debug ou reset user)
// ─────────────────────────────────────────────────────────────

export async function clearSession() {
  try {
    await AsyncStorage.removeItem('supabase-auth-token');
    await supabase.auth.signOut();
    console.log('✅ Session Supabase vidée avec succès');
  } catch (error) {
    console.error('❌ Erreur clearSession :', error);
  }
}

// ─────────────────────────────────────────────────────────────
// Interface type profil utilisateur
// ─────────────────────────────────────────────────────────────

export interface Profile {
  user_id: string;
  first_names?: string[];
  children_names?: string[];
  avatar_url?: string | null;
  created_at?: string;
  current_period_end?: string | null;
  plumette_left?: number | null;
  last_plumette_recharge: string | null;
}

// ─────────────────────────────────────────────────────────────
// Récupération du profil utilisateur connecté
// ─────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) return null;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('current_period_end')
    .eq('user_id', user.id)
    .single();

  return {
    ...profile,
    current_period_end: subscription?.current_period_end ?? null,
  };
}

// ─────────────────────────────────────────────────────────────
// Mise à jour du profil utilisateur
// ─────────────────────────────────────────────────────────────

export async function updateProfile({
  first_names,
  children_names,
  avatar_url,
  current_period_end,
}: {
  first_names?: string[];
  children_names?: string[];
  avatar_url?: string | null;
  current_period_end?: string | null;
}): Promise<Profile | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  const updates: Partial<Profile> = {
    user_id: user.id,
    first_names,
    children_names,
    avatar_url,
    current_period_end,
  };

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  return error ? null : data;
}

// ─────────────────────────────────────────────────────────────
// Recharge automatique des plumettes (trigger minuit)
// ─────────────────────────────────────────────────────────────

export const refreshPlumettes = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const response = await fetch(`https://qstvlvkdzrewqqxaesho.supabase.co/functions/v1/refresh-plum`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!response.ok) {
    console.error('❌ Erreur refresh plumettes :', await response.text());
    return null;
  }

  return await response.json();
};

// ─────────────────────────────────────────────────────────────
// Vérifie les droits et décrémente 1 plumette si possible
// ─────────────────────────────────────────────────────────────

export async function checkAndDecrementPlumette(): Promise<true | Response> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return new Response('Utilisateur non authentifié', { status: 401 });

  const profile = await getProfile();
  const now = new Date();
  const isSub = profile?.current_period_end && new Date(profile.current_period_end) > now;

  if (!isSub) {
    const { data: plumette, error } = await supabase
      .from('plumette')
      .select('count')
      .eq('user_id', user.id)
      .single();

    if (error || !plumette || plumette.count <= 0) {
      return new Response('Plus de plumettes disponibles', { status: 403 });
    }

    const { error: updateError } = await supabase
      .from('plumette')
      .update({ count: plumette.count - 1 })
      .eq('user_id', user.id);

    if (updateError) return new Response('Erreur décrémentation plumette', { status: 500 });
  }

  return true;
}

// ─────────────────────────────────────────────────────────────
// Vérifie si l'utilisateur est abonné
// ─────────────────────────────────────────────────────────────

export function isSubscriber(current_period_end?: string | null): boolean {
  return !!current_period_end && new Date(current_period_end) > new Date();
}

// ─────────────────────────────────────────────────────────────
// Récupère le nombre de plumettes restantes
// ─────────────────────────────────────────────────────────────

export async function getPlumetteCount(user_id: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('plumette')
    .select('count')
    .eq('user_id', user_id)
    .single();

  return error || !data ? null : data.count;
}

// ─────────────────────────────────────────────────────────────
// Décrémente manuellement une plumette (optionnel/test)
// ─────────────────────────────────────────────────────────────

export async function decrementPlumette(user_id: string): Promise<boolean> {
  const count = await getPlumetteCount(user_id);
  if (count === null || count <= 0) return false;

  const { error } = await supabase
    .from('plumette')
    .update({ count: count - 1 })
    .eq('user_id', user_id);

  return !error;
}

// ─────────────────────────────────────────────────────────────
// Sélection aléatoire d'un élément dans un tableau
// ─────────────────────────────────────────────────────────────

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────
// Appel à l'API Edge pour générer une histoire complète
// ─────────────────────────────────────────────────────────────

export async function generateStoryFromEdge({
  words,
  morale,
  style,
  becomeHeroes,
}: {
  words: string[];
  morale: string;
  style: string;
  becomeHeroes: boolean;
}): Promise<{ title: string; content: string; illustration: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Utilisateur non authentifié');

  if (!morale || !style) {
    throw new Error("Morale ou style manquant — impossible de générer une histoire.");
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/generate-story`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ words, morale, style, becomeHeroes }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Erreur Supabase Edge Function:', errorText);
    throw new Error(errorText);
  }

  return await res.json();
}
