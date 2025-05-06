import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  Alert,
  Pressable,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Lock, WrapText } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

GoogleSignin.configure({
  scopes: ['email'],
  webClientId: '640637681812-7lffko70vb8roq1j6jhrfuj4htco6214.apps.googleusercontent.com',
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);

      if (!email || !password) return setError('Veuillez remplir tous les champs.');
      if (!email.includes('@')) return setError('L’adresse email semble incorrecte.');

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : 'Une erreur est survenue.');
        return;
      }

      router.replace('/profile/profile');
    } catch (err) {
      console.error('Login error:', err);
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleNativeLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) throw new Error('Aucun ID token reçu');

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) {
        console.error('Erreur Supabase:', error.message);
        setError('Échec de la connexion avec Google');
        return;
      }

      router.replace('/profile/profile');
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Connexion annulée par l’utilisateur');
      } else {
        console.error('Erreur Google Signin:', error);
        setError('Erreur Google Sign-In');
      }
    }
  };

  const handleAppleNativeLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = credential;

      if (!identityToken) throw new Error('Pas de jeton d’identification reçu');

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: identityToken,
      });

      if (error) {
        console.error('Erreur Supabase:', error.message);
        setError('Échec de la connexion avec Apple');
        return;
      }

      router.replace('/profile/profile');
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        console.log('Connexion annulée par l’utilisateur');
      } else {
        console.error('Erreur Apple Signin:', error);
        setError('Erreur lors de la connexion avec Apple');
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!email || !email.includes('@')) {
      return Alert.alert('Adresse invalide', 'Veuillez entrer une adresse e-mail valide.');
    }
  
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email); // pas de redirectTo nécessaire
  
      if (error) throw error;
  
      Alert.alert('Lien envoyé', 'Vérifie ta boîte mail pour réinitialiser ton mot de passe.');
    } catch (err) {
      Alert.alert('Erreur', "Impossible d'envoyer l’e-mail de réinitialisation.");
    }
  };
  
  return (
    <ImageBackground source={require('@/assets/backgrounds/dreamy-stars1.png')} resizeMode="cover" style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(drawer)' as const)}>
          <WrapText size={24} color="#6b5b51" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Image source={require('@/assets/images/icon.png')} style={styles.mascot} />
          <Text style={styles.title}>Connexion</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#6b5b51" />
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
                <Lock size={20} color="#6b5b51" />
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
            </View>

            <TouchableOpacity onPress={handlePasswordReset}>
              <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.googleButton, loading && styles.loginButtonDisabled]}
              onPress={handleGoogleNativeLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>Se connecter avec Google</Text>
            </TouchableOpacity>

            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={20}
              style={{ width: '100%', height: 50, marginBottom: 24 }}
              onPress={handleAppleNativeLogin}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Pas encore de compte ?</Text>
              <TouchableOpacity onPress={() => router.push('/profile/signup')}>
                <Text style={styles.signupLink}>S'inscrire</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Pressable onPress={() => Linking.openURL('https://cinq-mots-pour-dodo.store/privacy.html')}>
            <Text style={{ textDecorationLine: 'underline' }}>Politique de confidentialité</Text>
          </Pressable>
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
    minHeight: '100%',
    paddingBottom: 40,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  mascot: {
    width: 120,
    height: 120,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: '#6b5b51',
    marginBottom: 8,
    textAlign: 'center',
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
  },
  inputContainer: {
    gap: 16,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 15,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: 'Quicksand-Regular',
    color: '#6b5b51',
    fontSize: 16,
    paddingVertical: 16,
    marginLeft: 12,
  },
  forgotPassword: {
    textAlign: 'right',
    fontFamily: 'Quicksand-Regular',
    color: '#6b5b51',
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  loginButton: {
    backgroundColor: '#ac9fb1',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    fontSize: 18,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#b3a79b',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  signupText: {
    fontFamily: 'Quicksand-Regular',
    color: '#6b5b51cc',
    fontSize: 16,
  },
  signupLink: {
    fontFamily: 'Poppins-Bold',
    color: '#6b5b51',
    fontSize: 16,
  },
});
