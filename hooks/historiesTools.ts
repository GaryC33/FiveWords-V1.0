import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getProfile } from '@/services/supabase';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import mime from 'mime';

// === 📚 INTERFACE ===

export interface SavedStory {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  date: string;
  words?: string[];
  isLastGenerated?: boolean; // ✅ nouveau champ
}

// === 🧠 GESTION LOCALE ===

export async function saveStoryLocally(story: SavedStory) {
  try {
    const existing = await AsyncStorage.getItem('stories');
    const all: SavedStory[] = existing ? JSON.parse(existing) : [];
    const updated = [story, ...all.filter(s => s.id !== story.id)];
    await AsyncStorage.setItem('stories', JSON.stringify(updated));
  } catch (err) {
    console.error('❌ Erreur saveStoryLocally :', err);
  }
}

export async function loadLocalStory(id: string): Promise<SavedStory | null> {
  try {
    const raw = await AsyncStorage.getItem('stories');
    const all: SavedStory[] = raw ? JSON.parse(raw) : [];
    return all.find(s => s.id === id) ?? null;
  } catch (err) {
    console.error('❌ Erreur loadLocalStory :', err);
    return null;
  }
}

export async function getLocalHistory(): Promise<SavedStory[]> {
  try {
    const raw = await AsyncStorage.getItem('stories');
    const all: SavedStory[] = raw ? JSON.parse(raw) : [];

    if (all.length === 0) return [];

    return all.map((story, index) => ({
      ...story,
      isLastGenerated: index === 0, // ✅ flag dernière histoire générée
    }));
  } catch (err) {
    console.error('❌ Erreur getLocalHistory :', err);
    return [];
  }
}

// === ☁️ GESTION SUPABASE (abonnés uniquement) ===

export async function canSaveToSupabase(): Promise<true | string> {
  const profile = await getProfile();
  const now = new Date();
  const subEnd = profile?.current_period_end ? new Date(profile.current_period_end) : null;
  return subEnd && subEnd > now ? true : 'Fonction réservée aux abonnés';
}

export async function saveStoryToSupabase(story: SavedStory) {
  try {
    const session = (await supabase.auth.getSession()).data.session;
    const user_id = session?.user?.id;
    const token = session?.access_token;

    if (!user_id || !token) throw new Error('Utilisateur non connecté');

    const canSave = await canSaveToSupabase();
    if (canSave !== true) {
      Alert.alert('Abonnement requis', canSave, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Voir les offres', onPress: () => router.push('/offres') },
      ]);
      return;
    }

    const response = await fetch('https://qstvlvkdzrewqqxaesho.functions.supabase.co/save-story', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        prompt: story.title,
        content: story.content,
        words: story.words ?? [],
      }),
    });

    const result = await response.json();
    if (!response.ok || !result.id) throw new Error(result.error || 'Erreur Supabase');

    await saveImageToSupabase(result.id, user_id, story.imageUrl);

  } catch (err: any) {
    console.error('❌ Erreur saveStoryToSupabase :', err);

  }
}


export async function fetchUserStoriesFromSupabase(): Promise<SavedStory[]> {
  try {
    const session = (await supabase.auth.getSession()).data.session;
    const user_id = session?.user.id;
    if (!user_id) return [];

    const { data, error } = await supabase
      .from('stories')
      .select('id, prompt, content, created_at, words')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur fetchUserStoriesFromSupabase :', error);
      return [];
    }

    return data.map((story, index) => ({
      id: story.id,
      title: story.prompt,
      content: story.content,
      imageUrl: '', // sera mis à jour après image fetch
      date: story.created_at,
      words: story.words ?? [],
      isLastGenerated: index === 0,
    }));
  } catch (err) {
    console.error('❌ Erreur fetchUserStoriesFromSupabase :', err);
    return [];
  }
}

// === 🖼️ ENVOI DE L'IMAGE ===

async function saveImageToSupabase(storyId: string, userId: string, imageUrl: string) {
  try {
    const localPath = FileSystem.cacheDirectory + `story-${storyId}.png`;
    const download = await FileSystem.downloadAsync(imageUrl, localPath);

    if (!download?.uri) return;

    const fileUri = download.uri;
    const mimeType = mime.getType(fileUri) || 'image/png';
    const fileName = `${Date.now()}.${mime.getExtension(mimeType) || 'png'}`;
    const storagePath = `${userId}/${storyId}/${fileName}`;

    const { data: signed, error } = await supabase
      .storage
      .from('story-images')
      .createSignedUploadUrl(storagePath);

    if (!signed || error) return;

    await FileSystem.uploadAsync(signed.signedUrl, fileUri, {
      httpMethod: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'x-upsert': 'true',
        Authorization: `Bearer ${signed.token}`,
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    await supabase
      .from('story_images')
      .insert({ story_id: storyId, user_id: userId, image_path: storagePath });

    await FileSystem.deleteAsync(fileUri, { idempotent: true });
  } catch (err) {
    console.error('❌ Erreur saveImageToSupabase :', err);
  }
}
