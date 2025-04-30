// WelcomeModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Switch, View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hide_welcome_modal_date';

const WelcomeModal = () => {
  const [visible, setVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const checkPreference = async () => {
      const storedDate = await AsyncStorage.getItem(STORAGE_KEY);
      const today = new Date().toISOString().substring(0, 10);
      if (storedDate !== today) {
        setVisible(true);
      }
    };
    checkPreference();
  }, []);

  const handleClose = async () => {
    const today = new Date().toISOString().substring(0, 10);
    if (dontShowAgain) {
      await AsyncStorage.setItem(STORAGE_KEY, today);
    }
    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView>
            <Text style={styles.title}>Bienvenue dans 5 mots pour dodo</Text>
            <Text style={styles.text}>L’application idéale pour instaurer un rituel du soir apaisant et créatif.</Text>

            <Text style={styles.subtitle}>Fonctionnement :</Text>
            <Text style={styles.text}>
              • Votre enfant propose 5 mots (ex : dragon, forêt, ballon, lune, musique){"\n"}
              • Une histoire douce est générée instantanément{"\n"}
              • Une illustration accompagne chaque conte{"\n"}
              • L’histoire est prête à être lue avant le coucher
            </Text>

            <Text style={styles.subtitle}>Respect de votre vie privée</Text>
            <Text style={styles.text}>
              • Prénom et e-mail (si vous créez un compte){"\n"}
              • Historique des histoires (localement ou en ligne si vous êtes abonné){"\n"}
              • Aucune publicité ciblée{"\n"}
              • Possibilité de supprimer votre compte à tout moment{"\n\n"}
              En utilisant cette app, vous acceptez notre{' '}
              <Text style={styles.link} onPress={() => Linking.openURL('https://cinq-mots-pour-dodo.store/privacy.html')}>
                Politique de confidentialité
              </Text>.
            </Text>

            <Text style={styles.warning}>
              ⚠️ Cette application utilise l’intelligence artificielle pour générer histoires et images.
              Le contenu peut parfois être imprévisible. Si une histoire vous semble inadaptée,
              merci d’utiliser la fonction "Signaler" pour nous aider à améliorer l’expérience.
            </Text>
          </ScrollView>

          <View style={styles.checkboxContainer}>
            <Switch
              value={dontShowAgain}
              onValueChange={setDontShowAgain}
              trackColor={{ false: '#999', true: '#2A2F4F' }}
            />
            <Text style={styles.text}>Ne plus afficher aujourd’hui</Text>
          </View>

          <Pressable onPress={handleClose} style={styles.button}>
            <Text style={styles.buttonText}>Continuer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default WelcomeModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
  warning: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#444',
    marginTop: 12,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#2A2F4F',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
