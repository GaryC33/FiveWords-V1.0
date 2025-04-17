// ─────────────────────────────────────────────────────────────
// Hook personnalisé : useProfileTools
// Gestion du profil utilisateur (chargement, modification, statut)
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { supabase, refreshPlumettes } from '@/services/supabase';
import { router } from 'expo-router';

// ─────────────────────────────────────────────────────────────
// Avatars disponibles pour la sélection dans l’interface
// ─────────────────────────────────────────────────────────────

export const AVATAR_OPTIONS = [
  'avatar1.png',
  'avatar2.png',
  'avatar3.png',
  'avatar4.png',
  'avatar5.png',
];

// ─────────────────────────────────────────────────────────────
// Structure du profil utilisateur
// ─────────────────────────────────────────────────────────────

export interface Profile {
  user_id: string;
  first_names?: string[];
  children_names?: string[];
  avatar_url?: string | null;
  created_at?: string;
  current_period_end?: string | null;
  plumette_left?: number | null;
  rewarded_today?: number | null;
  last_plumette_recharge?: string | null;
  mail_log?: string;
}

// ─────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────

export function useProfileTools() {
  // ────────── Données du profil ──────────
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'connected' | 'subscriber' | 'guest'>('guest');

  // ────────── Champs modifiables ──────────
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [firstNames, setFirstNames] = useState<string[]>([]);
  const [newFirstName, setNewFirstName] = useState('');
  const [childrenNames, setChildrenNames] = useState<string[]>([]);
  const [newChildName, setNewChildName] = useState('');

  // ────────── Statut de la sauvegarde ──────────
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Charge les données utilisateur depuis Supabase
  // Inclut recharge des plumettes via Edge Function
  // ─────────────────────────────────────────────────────────────

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setProfile(null);
        setStatus('guest');
        return;
      }

      const refreshed = await refreshPlumettes();

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error || !data) {
        console.error('❌ Erreur récupération profil :', error?.message);
        setProfile(null);
        setStatus('guest');
        return;
      }

      const finalProfile: Profile = {
        ...data,
        plumette_left: refreshed?.plumette_left ?? data.plumette_left ?? 0,
        last_plumette_recharge: refreshed?.last_plumette_recharge ?? data.last_plumette_recharge ?? null,
      };

      setProfile(finalProfile);
      setStatus(
        finalProfile.current_period_end && new Date(finalProfile.current_period_end) > new Date()
          ? 'subscriber'
          : 'connected'
      );

      setSelectedAvatar(finalProfile.avatar_url ?? AVATAR_OPTIONS[0]);
      setFirstNames(finalProfile.first_names ?? []);
      setChildrenNames(finalProfile.children_names ?? []);
    } catch (err) {
      console.error('❌ Erreur loadProfileTools :', err);
      setProfile(null);
      setStatus('guest');
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────
  // Enregistre les modifications du profil utilisateur
  // (avatar, prénoms adultes, prénoms enfants)
  // ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      setSaving(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: selectedAvatar,
          first_names: firstNames,
          children_names: childrenNames,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => router.back(), 1500);
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Chargement initial du profil au montage du hook
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ─────────────────────────────────────────────────────────────
  // Exposition des variables et fonctions au composant parent
  // ─────────────────────────────────────────────────────────────

  return {
    profile,
    status,              // 'guest' | 'connected' | 'subscriber'
    loading,
    reloadProfile: loadProfile,

    // 🧍 Champs liés à l’utilisateur
    selectedAvatar,
    setSelectedAvatar,
    firstNames,
    setFirstNames,
    newFirstName,
    setNewFirstName,
    childrenNames,
    setChildrenNames,
    newChildName,
    setNewChildName,

    // 🔁 Sauvegarde
    handleSave,
    error,
    success,
    saving,
  };
}
