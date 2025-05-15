import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import {
  WrapText,
  Settings,
  LogOut,
  CirclePlus as Edit2,
  Star,
} from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import { useProfileTools } from '@/hooks/profilesTools';
import Rewarded from '@/app/admob/Rewarded';
import Banner from '@/app/admob/Banner';
import { usePlumetteTimer } from '@/hooks/plumettesTimer';
import PlumetteBadge from '@/components/PlumetteBadge';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restorePurchases } from '@/services/iap'

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


export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRewarded, setShowRewarded] = useState(false);
  const { profile, status, reloadProfile } = useProfileTools();
  const isSubscriber = status === 'subscriber';
  const RewardedResolver = useRef<(rewarded: boolean) => void>();
  const accountStatus = isSubscriber ? 'Premium' : 'Offre découverte';
  const nextPlumetteTimer = usePlumetteTimer(profile?.last_plumette_recharge ?? null);
  const plumetteCount = isSubscriber ? '∞' : `${profile?.plumette_left ?? 0}`;
  const [becomeHeroes, setBecomeHeroes] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
const [editingField, setEditingField] = useState<'parent' | 'child' | null>(null);
const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('becomeHeroes').then(value => {
      if (value === 'true' && isSubscriber) {
        setBecomeHeroes(true);
      } else {
        setBecomeHeroes(false);
      }
    });
  }, [isSubscriber]);
  
  
  const toggleSwitch = (val: boolean) => {
    if (!isSubscriber) {
      Alert.alert(
        'Abonnement requis',
        'Cette fonctionnalité est réservée aux abonnés.',
        [
          { text: 'Voir les offres', onPress: () => router.push('/offres') },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
      return;
    }
  
    setBecomeHeroes(val);
    AsyncStorage.setItem('becomeHeroes', val ? 'true' : 'false');
  };
  
  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
          await reloadProfile();
        } catch (err) {
          setError('Impossible de récupérer le profil');
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, [reloadProfile])
  );

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/profile/login');
    } catch (err) {
      setError('Une erreur est survenue lors de la déconnexion');
    }
  };
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Supprimer votre compte",
      "Cette action est définitive et supprimera toutes vos données associées.\n\n⚠️ Si vous avez un abonnement via l'App Store, pensez à l'annuler depuis votre compte Apple.",
      [
        {
          text: "Gérer mes abonnements",
          onPress: () =>
            router.push("https://apps.apple.com/account/subscriptions"),
        },
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer maintenant",
          style: "destructive",
          onPress: async () => {
            try {
              const session = (await supabase.auth.getSession()).data.session;
              const user = session?.user;
              if (!user) throw new Error("Utilisateur non connecté.");
  
              // Appelle la fonction Supabase sécurisée
              const { error } = await supabase.rpc("delete_user");
              
  
              if (error) throw error;
  
              // Optionnel : vider le local storage
              await AsyncStorage.clear();
  
              Alert.alert(
                "Compte supprimé",
                "Votre compte et toutes vos données ont été supprimés avec succès."
              );
  
              await supabase.auth.signOut();
              router.replace("/profile/login");
            } catch (err: any) {
              Alert.alert("Erreur", err.message || "Une erreur est survenue.");
            }
          },
        },
      ]
    );
  };
  
  
  const handleReward = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session?.access_token) return;

    const res = await fetch('https://qstvlvkdzrewqqxaesho.supabase.co/functions/v1/reward-plumette', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    const result = await res.json();
    if (res.ok) {
      Alert.alert('Bravo !', 'Tu as gagné une plumette 🎉');
      reloadProfile();
    } else {
      Alert.alert('Oups...', result.error || 'Erreur inconnue');
    }
  };

  const openRewarded = () => {
    return new Promise<boolean>((resolve) => {
      RewardedResolver.current = resolve;
      setShowRewarded(true);
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.replace('/profile/profile')}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const selectedAvatar = AVATAR_OPTIONS.find(a => a.filename === profile?.avatar_url)?.source ?? AVATAR_OPTIONS[0].source;
 
  
    return (
      <>
        <Banner isSubscriber={status === 'subscriber'} position="top" />
    
        <PlumetteBadge
          text={plumetteCount}
          onPressAdd={async () => {
            const rewarded = await openRewarded();
            if (rewarded) handleReward();
          }}
        />
    
<TouchableOpacity
  style={styles.backButton}
  onPress={() => router.push('/(drawer)')}
>
  <Text style={{ fontSize: 24, color: '#6b5b51' }}>←</Text>
</TouchableOpacity>

    
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ImageBackground
            source={require('@/assets/backgrounds/dreamy-stars1.png')}
            style={styles.backgroundimage}
            resizeMode="cover"
          >
            {/* Avatar et infos principales */}
            <View style={styles.topContainer}>
              <View style={styles.avatarContainerCentered}>
                <View style={styles.avatarWrapper}>
                  <Image source={selectedAvatar} style={styles.avatarLarge} />
                  <Image
                    source={
                      isSubscriber
                        ? require('@/assets/icons/badge1.png')
                        : require('@/assets/icons/badge2.png')
                    }
                    style={styles.badgeLarge}
                  />
                </View>
              </View>
    
              <View style={styles.mergedInfoBox1}>
                <Text style={styles.infoTextmail}>
                  📫: {profile?.mail_log || 'Adresse inconnue'}
                </Text>
              </View>
    
              {!isSubscriber && (
                <>
                  <View style={styles.mergedInfoBox}>
                    <Text style={styles.infoTextrech}>
                      📣 Recharge dispo. aujourd'hui : {5 - (profile?.rewarded_today ?? 0)}/5
                    </Text>
                  </View>
    
                  <View style={styles.mergedInfoBox}>
                    <Text style={styles.infoText}>
                      <Image
                        source={require('@/assets/icons/plumette.png')}
                        style={styles.icon}
                        resizeMode="contain"
                      />
                      Nouvelle plumette dans {nextPlumetteTimer}
                    </Text>
                  </View>
                </>
              )}
            </View>
    
            {/* Nuages + switch */}
            <View
  style={{
    backgroundColor: '#e7d7eb',
    marginHorizontal: 10,
    padding: 0,
    borderRadius: 24,
    marginVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
  }}
>
{/* Nuages + switch */}
<View
  style={{
    backgroundColor: '#e7d7eb',
    marginHorizontal: 10,
    padding: 0,
    borderRadius: 24,
    marginVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 0,
  }}
>
  <View style={styles.switchContainer}>
    <View style={styles.switchRow}>
      <Switch value={becomeHeroes} onValueChange={toggleSwitch} />
      <Text style={styles.switchLabel}>Devenir les héros</Text>
    </View>
  </View>

  <View style={styles.cloudsRow}>
    {[{
      label: profile?.first_names?.join(', ') || 'Surnoms parent(s)',
    }, {
      label: profile?.children_names?.join(', ') || 'Surnoms enfant(s)',
    }].map((cloud, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => {
          if (!isSubscriber) {
            Alert.alert('Abonnement requis', 'Cette fonction est réservée aux abonnés.', [
              { text: 'Voir les offres', onPress: () => router.push('/offres') },
              { text: 'Annuler', style: 'cancel' },
            ]);
            return;
          }
          setEditingField(index === 0 ? 'parent' : 'child');
          setInputValue(
            index === 0
              ? profile?.first_names?.join(', ') ?? ''
              : profile?.children_names?.join(', ') ?? ''
          );
          setModalVisible(true);
        }}
        style={[
          !isSubscriber && { opacity: 0.4 }, // Applique l'opacité si l'utilisateur n'est pas abonné
        ]}
 // Empêche l'interaction si l'utilisateur n'est pas abonné (optionnel)
      >
        <ImageBackground
          source={require('@/assets/images/cloud.png')}
          style={styles.cloudImage}
          imageStyle={{ resizeMode: 'contain' }}
        >
          <Text style={styles.cloudText}>{cloud.label}</Text>
        </ImageBackground>
      </TouchableOpacity>
    ))}
  </View>
</View>
</View>

    
            {/* Bouton historique */}
            <TouchableOpacity
              style={[styles.button, styles.historyButton, !isSubscriber && styles.disabledButton]}
              onPress={() => {
                if (isSubscriber) {
                  router.push('/history');
                } else {
                  Alert.alert('Abonnement requis', 'Cette fonctionnalité est réservée aux abonnés.', [
                    { text: 'Voir les offres', onPress: () => router.push('/offres') },
                    { text: 'Annuler', style: 'cancel' },
                  ]);
                }
              }}
            >
              <Star size={24} color={isSubscriber ? '#6b5b51' : '#aaa'} />
              <Text
                style={[
                  styles.buttonText,
                  styles.editButtonText,
                  !isSubscriber && { color: '#aaa' },
                ]}
              >
                Charger mon historique
              </Text>
            </TouchableOpacity>

            {/* Boutons de fin */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => {
                  if (isSubscriber) {
                    router.push('/profile/edit');
                  } else {
                    Alert.alert('Abonnement requis', 'Cette fonction est réservée aux abonnés.', [
                      { text: 'Voir les offres', onPress: () => router.push('/offres') },
                      { text: 'Annuler', style: 'cancel' },
                    ]);
                  }
                }}
              >
                <Settings size={24} color={isSubscriber ? '#6b5b51' : '#bbb'} />
                <Text style={[styles.buttonText, styles.editButtonText, !isSubscriber && { color: '#bbb' }]}>
                  Changer avatar
                </Text>
              </TouchableOpacity>
    
              <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <LogOut size={24} color="#ae6e1f" />
                <Text style={[styles.buttonText, styles.logoutButtonText]}>Se déconnecter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
  <Text style={[styles.buttonText, styles.deleteButtonText]}>🗑 Supprimer votre compte</Text>
</TouchableOpacity>

            </View>
            
          </ImageBackground>
        </ScrollView>
    
        {/* Rewarded ads + Banner */}
        <Rewarded
          visible={showRewarded}
          onClose={(rewarded) => {
            setShowRewarded(false);
            RewardedResolver.current?.(rewarded);
          }}
        />
        <Banner isSubscriber={status === 'subscriber'} position="bottom" />
    
        {/* Modal prénom cloud */}
        {modalVisible && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 20,
              width: '80%'
            }}>
              <Text style={{
                fontFamily: 'Poppins-Bold',
                fontSize: 16,
                marginBottom: 10
              }}>
                Modifier les surnoms {editingField === 'parent' ? 'du parent' : 'de l’enfant'}
              </Text>
    
              <Text style={{
                fontFamily: 'Quicksand-Regular',
                fontSize: 14,
                marginBottom: 10
              }}>
                Sépare les surnoms par des virgules
              </Text>
    
              <TextInput
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Ex: Papa, Maman"
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 10,
                  padding: 10,
                  fontFamily: 'Quicksand-Regular'
                }}
              />
    
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20
              }}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={{
                    color: '#ae6e1f',
                    fontFamily: 'Poppins-Bold'
                  }}>
                    Annuler
                  </Text>
                </TouchableOpacity>
    
                <TouchableOpacity onPress={async () => {
                  const values = inputValue.split(',').map(s => s.trim()).filter(Boolean);
                  const field = editingField === 'parent' ? 'first_names' : 'children_names';
    
                  const { error } = await supabase
                    .from('profiles')
                    .update({ [field]: values })
                    .eq('user_id', profile?.user_id);
    
                  if (!error) {
                    await reloadProfile();
                    setModalVisible(false);
                  } else {
                    Alert.alert('Erreur', 'Impossible d’enregistrer');
                  }
                }}>
                  <Text style={{
                    color: '#4a6b3c',
                    fontFamily: 'Poppins-Bold'
                  }}>
                    Enregistrer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </>
    );
  }

const styles = StyleSheet.create({
  // === GÉNÉRAL
  scrollContent: { paddingTop: 0, paddingBottom: 60 },
  backgroundimage: { width: '100%' },
  background: {
    flex: 1,
    backgroundColor: '#e9e1d6',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e9e1d6' },
  backButton: { position: 'absolute', top: 60, left: 20, zIndex: 1 },

  // === ÉTAT CHARGEMENT / ERREUR
  loadingText: { fontFamily: 'Quicksand-Regular', fontSize: 16, color: '#6b5b51' },
  errorText: { fontFamily: 'Quicksand-Regular', fontSize: 16, color: '#d96d55', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#ac9fb1', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
  retryButtonText: { fontFamily: 'Poppins-Bold', fontSize: 16, color: '#fff' },

  // === AVATAR
  topContainer: { alignItems: 'center', paddingTop: 40, paddingBottom: 20, backgroundColor: 'transparent', marginBottom: 10, position: 'relative' },
  avatarContainerCentered: { alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  avatarLarge: { width: 160, height: 160, borderRadius: 80, borderWidth: 5, borderColor: '#fff', backgroundColor: '#fff' },

  deleteButton: {
    backgroundColor: '#d9534f',
  },
  deleteButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
  },
  
  badgeContainer: {    marginTop: 12,    alignItems: 'center',  },
  avatarWrapper: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'flex-end', // badge en bas
    position: 'relative',
  },
  badgeLarge: {
    position: 'absolute',
    bottom: -40,
    width: 75,
    height: 75,
    resizeMode: 'contain',
  },
  
  // === INFOS BOX
  mergedInfoBox1: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'center',
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 20,
    gap: 3,
    marginTop: 30,
  },  mergedInfoBox: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 20,
    gap: 3,
    marginTop: 0,
  },  infoText: { color: '#444', fontSize: 16, fontFamily: 'Quicksand-SemiBold', textAlign: 'left' },
  infoTextmail: { color: '#444', fontSize: 16, fontFamily: 'Quicksand-SemiBold', textAlign: 'left' },
  infoTextrech: { color: '#444', fontSize: 16, fontFamily: 'Quicksand-SemiBold', textAlign: 'left' },
  icon: { width: 16, height: 16 },
  
  // === NUAGES
  cloudsRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingHorizontal: 10, marginVertical: 10 },
  cloudImage: { width: 160, height: 100, justifyContent: 'center', alignItems: 'center', padding: 5 },
  cloudText: { color: '#000', fontFamily: 'Quicksand-Regular', textAlign: 'center' },

  // === SWITCH
  switchContainer: { marginTop: 10, marginBottom: 10, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#e7c550', borderRadius: 30, alignSelf: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchLabel: { color: '#444', fontFamily: 'Quicksand-Regular', fontSize: 14 },

  // === BOUTONS
  buttonContainer: { marginTop: 16, gap: 16 },
  button: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 20, gap: 12 },
  buttonText: { fontFamily: 'Poppins-Bold', fontSize: 18 },
  historyButton: { backgroundColor: '#e7d7eb', marginTop: 8 },
  editButton: { backgroundColor: '#e7d7eb' },
  logoutButton: { backgroundColor: '#fff0db' },
  editButtonText: { color: '#6b5b51' },
  logoutButtonText: { color: '#ae6e1f' },

  // === ÉTATS
  disabledSection: { opacity: 0.4 },
  disabledButton: { backgroundColor: '#f0f0f0', borderColor: '#ccc', borderWidth: 1 },
});
