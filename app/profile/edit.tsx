import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { WrapText, Save, Plus, X } from 'lucide-react-native';
import { supabase } from '@/services/supabase';

const AVATAR_OPTIONS = [
  { filename: '1.png', source: require('@/assets/avatars/1.png') },
  { filename: '2.png', source: require('@/assets/avatars/2.png') },
  { filename: '3.png', source: require('@/assets/avatars/3.png') },
  { filename: '4.png', source: require('@/assets/avatars/4.png') },
  { filename: '5.png', source: require('@/assets/avatars/5.png') },
  { filename: '6.png', source: require('@/assets/avatars/6.png') },
  { filename: '7.png', source: require('@/assets/avatars/7.png') },
  { filename: '8.png', source: require('@/assets/avatars/8.png') },
  { filename: '9.png', source: require('@/assets/avatars/9.png') },
  { filename: '10.png', source: require('@/assets/avatars/10.png') },
  { filename: '11.png', source: require('@/assets/avatars/11.png') },
  { filename: '12.png', source: require('@/assets/avatars/12.png') },
  { filename: '13.png', source: require('@/assets/avatars/13.png') },
  { filename: '14.png', source: require('@/assets/avatars/14.png') },
  { filename: '15.png', source: require('@/assets/avatars/15.png') },
  { filename: '16.png', source: require('@/assets/avatars/16.png') },
];


export default function EditProfileScreen() {
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].filename);
  const [firstNames, setFirstNames] = useState<string[]>([]);
  const [newFirstName, setNewFirstName] = useState('');
  const [childrenNames, setChildrenNames] = useState<string[]>([]);
  const [newChildName, setNewChildName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/profile/login');

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, first_names, children_names, current_period_end')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const selected = AVATAR_OPTIONS.find(a => a.filename === profile.avatar_url);
        setSelectedAvatar(selected?.filename || AVATAR_OPTIONS[0].filename);
        setFirstNames(profile.first_names || []);
        setChildrenNames(profile.children_names || []);
        setIsSubscriber(profile.current_period_end && new Date(profile.current_period_end) > new Date());
      }
    } catch (err) {
      setError("Erreur lors du chargement du profil");
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

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
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('@/assets/backgrounds/dreamy-stars1.png')} resizeMode="cover" style={styles.background}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <WrapText size={24} color="#6b5b51" />
        </TouchableOpacity>

        <Text style={styles.title}>Selection d'avatar</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        {/* Avatar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avatar</Text>
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((avatar, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedAvatar(avatar.filename)}
                style={[styles.avatarOption, selectedAvatar === avatar.filename && styles.selectedAvatar]}
              >
                <Image source={avatar.source} style={styles.avatarImage} />
              </TouchableOpacity>
            ))}
          </View>
        </View>



        <TouchableOpacity
          style={[styles.saveButton, (!isSubscriber || loading) && { opacity: 0.3 }]}
          onPress={handleSave}
          disabled={!isSubscriber || loading}
        >
          <Save size={24} color="#fff" />
          <Text style={styles.saveText}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#e9e1d6' },
  content: { padding: 20, paddingTop: 60 },
  backButton: { marginBottom: 16 },
  title: { fontFamily: 'Poppins-Bold', fontSize: 30, color: '#6b5b51', textAlign: 'center', marginBottom: 24 },
  error: { fontFamily: 'Quicksand-Regular', color: '#d96d55', textAlign: 'center', marginBottom: 12 },
  success: { fontFamily: 'Quicksand-Regular', color: '#4ade80', textAlign: 'center', marginBottom: 12 },
  section: { marginBottom: 28 },
  sectionTitle: { fontFamily: 'Poppins-Bold', fontSize: 18, color: '#6b5b51', marginBottom: 12 },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 16 },
  avatarOption: { padding: 4, borderRadius: 40 },
  selectedAvatar: { backgroundColor: '#ac9fb1' },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  disabledSection: { opacity: 0.3 },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#f7f3ef', borderRadius: 15, paddingHorizontal: 16, fontSize: 16, color: '#6b5b51', fontFamily: 'Quicksand-Regular' },
  addButton: { backgroundColor: '#ac9fb1', borderRadius: 24, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  saveButton: { flexDirection: 'row', backgroundColor: '#ac9fb1', paddingVertical: 16, borderRadius: 20, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  saveText: { fontFamily: 'Poppins-Bold', fontSize: 18, color: '#fff' },
});