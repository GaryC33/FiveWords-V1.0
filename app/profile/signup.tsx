import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, WrapText } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import * as Crypto from 'expo-crypto';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSignup = async () => {
    try {
      setError('');
      setInfo('');
      setLoading(true);

      if (!email || !password || !confirmPassword) {
        setError('Merci de compléter tous les champs.');
        return;
      }

      if (!email.includes('@')) {
        setError("L’adresse e-mail semble incorrecte.");
        return;
      }

      if (password.length < 6) {
        setError('Choisissez un mot de passe d’au moins 6 caractères.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Les mots de passe ne sont pas identiques.');
        return;
      }

      // 🔐 Hash email avant vérification
      const emailHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        email.trim().toLowerCase()
      );

      // 🔍 Vérifie si ce hash existe dans deleted_users
      const { data: existing, error: checkError } = await supabase
        .from('deleted_users')
        .select('email_hash')
        .eq('email_hash', emailHash);

      if (checkError) throw checkError;

      if (existing.length > 0) {
        setError("Ce compte a été supprimé et ne peut pas être recréé.");
        return;
      }

      // ✅ Inscription via Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      setInfo("Un e-mail de confirmation vous a été envoyé. Veuillez vérifier votre boîte de réception.");

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err?.message || "Une erreur est survenue lors de l'inscription.");
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
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <WrapText size={24} color="#6b5b51" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Bienvenue dans la communauté des créateurs de magie{'\n'}et de contes du soir
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#6b5b51" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#a3978d"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={20} color="#6b5b51" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mot de passe"
                placeholderTextColor="#a3978d"
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Lock size={20} color="#6b5b51" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#a3978d"
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? 'Inscription...' : 'S’inscrire'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/profile/login')}>
              <Text style={styles.loginLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#e9e1d6' },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontFamily: 'Poppins-Bold', fontSize: 32, color: '#6b5b51', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontFamily: 'Quicksand-Regular', fontSize: 18, color: '#6b5b51cc', textAlign: 'center', lineHeight: 24 },
  error: { fontFamily: 'Quicksand-Regular', color: '#d96d55', marginBottom: 16, textAlign: 'center' },
  info: { fontFamily: 'Quicksand-Regular', color: '#ffffff', marginBottom: 16, textAlign: 'center' },
  form: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  inputContainer: { gap: 16, marginBottom: 24 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 15, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontFamily: 'Quicksand-Regular', color: '#6b5b51', fontSize: 16, paddingVertical: 16 },
  signupButton: { backgroundColor: '#ac9fb1', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginBottom: 24 },
  signupButtonDisabled: { opacity: 0.7 },
  signupButtonText: { fontFamily: 'Poppins-Bold', color: '#fff', fontSize: 18 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  loginText: { fontFamily: 'Quicksand-Regular', color: '#6b5b51cc', fontSize: 16 },
  loginLink: { fontFamily: 'Poppins-Bold', color: '#6b5b51', fontSize: 16 },
});
