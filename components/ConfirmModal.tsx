// ConfirmModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { usePlumetteTimer } from '@/hooks/plumettesTimer';
import { checkAndDecrementPlumette } from '@/services/supabase';

export default function ConfirmModal({
  visible,
  onCancel,
  onConfirm,
  plumetteLeft,
  lastPlumetteRecharge,
  goToSubscribe,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  plumetteLeft: number;
  lastPlumetteRecharge: string | null;
  goToSubscribe: () => void;
}) {
  const nextPlumetteTimer = usePlumetteTimer(lastPlumetteRecharge);

  const handleConfirm = async () => {
    const result = await checkAndDecrementPlumette();
    if (result !== true) {
      const msg = result instanceof Response ? await result.text() : 'Erreur inconnue';
      Alert.alert('Impossible de générer', msg);
      return;
    }
    onConfirm();
  };

  const handleSubscribe = () => {
    onCancel();
    goToSubscribe();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Générer une histoire</Text>

          {plumetteLeft > 0 ? (
            <>
              <Text style={styles.text}>Cette action va consommer 1 plumette.</Text>
              <Image source={require('@/assets/icons/plumette.png')} style={styles.icon} />
              <View style={styles.buttons}>
                <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.confirm]} onPress={handleConfirm}>
                  <Text style={styles.buttonText}>Dépenser 1 plumette</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.text}>Tu n'as plus de plumettes !</Text>
              <Text style={styles.timerText}>Prochaine gratuite dans {nextPlumetteTimer}</Text>
              <View style={styles.buttons}>
                <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.confirm]} onPress={onConfirm}>
                  <Text style={styles.buttonText}>📺 Voir une pub</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.subscribe]} onPress={handleSubscribe}>
                  <Text style={styles.buttonText}>⭐ S’abonner</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '85%', alignItems: 'center' },
  title: { fontFamily: 'Poppins-Bold', fontSize: 20, marginBottom: 10 },
  text: { fontFamily: 'Quicksand-Regular', fontSize: 16, textAlign: 'center', marginBottom: 12 },
  timerText: { fontFamily: 'Quicksand-Regular', fontSize: 14, textAlign: 'center', color: '#555', marginBottom: 8 },
  icon: { width: 32, height: 32, marginBottom: 12 },
  buttons: { flexDirection: 'column', gap: 8, width: '100%' },
  button: { paddingVertical: 12, borderRadius: 30, alignItems: 'center' },
  cancel: { backgroundColor: '#ccc' },
  confirm: { backgroundColor: '#a19cf4' },
  subscribe: { backgroundColor: '#4a4381' },
  buttonText: { fontFamily: 'Poppins-Bold', color: '#fff', fontSize: 14 },
});
