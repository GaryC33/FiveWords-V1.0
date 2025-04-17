import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import mime from 'mime';
import { Alert } from 'react-native';

/**
 * Télécharge une image distante, l’enregistre dans Supabase Storage, 
 * et crée une entrée dans la table `story_images`
 * 
 * @param storyId ID de l’histoire à associer
 * @param userId ID de l’utilisateur propriétaire
 * @param imageUrl URL distante de l’image (ex : depuis serveur Flux)
 */
export async function saveImageToSupabase(storyId: string, userId: string, imageUrl: string) {
  try {
    // 1. Télécharger l’image en cache local
    const localPath = FileSystem.cacheDirectory + `story-${storyId}.png`;
    const downloadRes = await FileSystem.downloadAsync(imageUrl, localPath);

    if (!downloadRes || !downloadRes.uri) {
      console.error('📥 Téléchargement échoué depuis', imageUrl);
      return;
    }

    const fileUri = downloadRes.uri;
    const mimeType = mime.getType(fileUri) || 'image/png';
    const fileExt = mime.getExtension(mimeType) || 'png';
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${storyId}/${fileName}`;

    // 2. Générer une URL signée pour l’upload
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('story-images')
      .createSignedUploadUrl(filePath);

    if (signedUrlError || !signedUrlData) {
      console.error('❌ Erreur création URL signée :', signedUrlError);
      return;
    }

    const { signedUrl, token } = signedUrlData;

    // 3. Envoyer l’image via uploadAsync
    const uploadRes = await FileSystem.uploadAsync(signedUrl, fileUri, {
      httpMethod: 'PUT',
      headers: {
        'Content-Type': mimeType,
        'x-upsert': 'true',
        Authorization: `Bearer ${token}`,
      },
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    });

    if (uploadRes.status !== 200) {
      console.error('❌ Upload échoué :', uploadRes.body);
      return;
    }

    // 4. Ajouter l’entrée dans la table story_images
    const { error: insertError } = await supabase
      .from('story_images')
      .insert({
        story_id: storyId,
        user_id: userId,
        image_path: filePath,
      });

    if (insertError) {
      console.error('🗃️ Erreur insertion dans story_images :', insertError);
    } else {
      console.log('✅ Image enregistrée dans Supabase !');
    }

    // (optionnel) Supprimer le fichier local
    await FileSystem.deleteAsync(fileUri, { idempotent: true });

  } catch (error) {
    console.error('❌ Erreur dans saveImageToSupabase :', error);
    Alert.alert('Erreur', 'Une erreur est survenue pendant la sauvegarde de l’image.');
  }
}
