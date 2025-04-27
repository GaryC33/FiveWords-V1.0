import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/services/supabase';

interface ReportButtonProps {
  storyId: string;
  title: string;
  content: string;
  imageUrl: string;
  words: string[];
}

export const ReportButton = ({
  storyId,
  title,
  content,
  imageUrl,
  words,
}: ReportButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) throw new Error("Utilisateur non connecté.");

      const imagePath = await uploadImageToStorage(imageUrl, user.id);

      const { error } = await supabase.from('reports').insert([
        {
          user_id: user.id,
          title_r: title,
          content_r: content,
          word_r: words,
          image_path_r: imagePath,
          reason,
          created: new Date().toISOString(),
        },
      ]);
      console.log("User ID from Supabase session:", user.id)

      if (error) throw new Error(error.message);

      Alert.alert("Merci 🙏", "Votre signalement a bien été envoyé.");
      setModalVisible(false);
      setReason('');
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>🚩 Signaler</Text>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Signaler cette histoire</Text>
            <TextInput
              placeholder="Décris la raison du signalement"
              style={styles.input}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={!reason || loading}
              >
                <Text style={styles.submitText}>Envoyer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const uploadImageToStorage = async (
  imageUri: string,
  userId: string
): Promise<string | null> => {
  try {
    const fileName = `report-${userId}-${Date.now()}.jpg`;
    const tempPath = FileSystem.cacheDirectory + fileName;

    const downloaded = await FileSystem.downloadAsync(imageUri, tempPath);
    if (!downloaded?.uri) throw new Error('Erreur téléchargement image');

    const base64 = await FileSystem.readAsStringAsync(downloaded.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const contentType = 'image/jpeg';
    const base64DataUrl = `data:${contentType};base64,${base64}`;

    const { error } = await supabase.storage
      .from('reports')
      .upload(fileName, base64DataUrl, {
        contentType,
        upsert: false,
      });

    await FileSystem.deleteAsync(downloaded.uri, { idempotent: true });

    if (error) {
      console.error('Erreur upload image:', error.message);
      return null;
    }

    return fileName;
  } catch (err) {
    console.error('❌ Erreur uploadImageToStorage :', err);
    return null;
  }
};

const styles = StyleSheet.create({
  container: { alignItems: 'flex-end', marginBottom: 12 },
  button: {
    backgroundColor: '#d9534f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: { padding: 10 },
  cancelText: { color: '#999', fontFamily: 'Quicksand-SemiBold' },
  submitButton: {
    padding: 10,
    backgroundColor: '#4a4381',
    borderRadius: 6,
  },
  submitText: { color: '#fff', fontFamily: 'Poppins-Bold' },
});
