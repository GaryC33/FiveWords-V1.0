import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Lock, WrapText } from 'lucide-react-native';
import { supabase } from '@/services/supabase';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setError('');

    if (!password || !confirmPassword) {
      return setError('Merci de remplir les deux champs.');
    }

    if (password.length < 6) {
      return setError('Le mot de passe doit contenir au moins 6 caractères.');
    }

    if (password !== confirmPassword) {
      return setError('Les mots de passe ne sont pas identiques.');
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      Alert.alert('Mot de passe changé', 'Vous pouvez maintenant vous connecter.');
      router.replace('/profile/login');
    } catch (err) {
      console.error('Reset error:', err);
      setError('Une erreur est survenue lors de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/backgrounds/dreamy-stars1.png')}
      resizeMode="cover"
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/profile/login')}>
          <WrapText size={24} color="#6b5b51" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Nouveau mot de passe</Text>
          <Text style={styles.subtitle}>Choisissez un mot de passe sécurisé</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#6b5b51" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#a3978d"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={20} color="#6b5b51" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#a3978d"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>
              {loading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#e9e1d6',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
    color: '#6b5b51',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#6b5b51cc',
    textAlign: 'center',
    lineHeight: 22,
  },
  error: {
    fontFamily: 'Quicksand-Regular',
    color: '#d96d55',
    marginBottom: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 15,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Quicksand-Regular',
    color: '#6b5b51',
    fontSize: 16,
    paddingVertical: 16,
  },
  resetButton: {
    backgroundColor: '#ac9fb1',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  resetButtonDisabled: {
    opacity: 0.7,
  },
  resetButtonText: {
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: 18,
  },
});
