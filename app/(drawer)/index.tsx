import React, { useState, useRef, useCallback, useEffect } from 'react';
import {  View,  Text,  StyleSheet,  ScrollView,  TouchableOpacity,  ActivityIndicator,  ImageBackground,  Alert,  Image,} from 'react-native';
import { Trash2 } from 'lucide-react-native'; // Assuming icon library
import { Picker } from '@react-native-picker/picker'; // For dropdown selections
import { useFocusEffect, router } from 'expo-router'; // Expo's routing and lifecycle hook

import AnimatedWordBubble from '@/components/AnimatedWordBubble';
import LoadingOverlay from '@/components/LoadingOverlay';
import MagicWordModal from '@/components/MagicWordModal';
import PlumetteBadge from '@/components/PlumetteBadge';
import WelcomeModal from '@/components/WelcomeModal';
import ConfirmModal from '@/components/ConfirmModal';

import Banner from '@/app/admob/Banner'; // Ad banner component
import Rewarded from '@/app/admob/Rewarded'; // Rewarded ad component
import Interstitial from '@/app/admob/Interstitial'; // Interstitial ad component
import { usePlumetteTimer } from '@/hooks/plumettesTimer';

import { useProfileTools } from '@/hooks/profilesTools'; // Hook for user profile data
import { WordSelector } from '@/hooks/wordsTools'; // Hook/component for word selection
import { supabase } from '@/services/supabase'; // Supabase database connection
import { generateStoryFromEdge, pickRandom } from '@/services/supabase'; // Supabase functions for story generation
import AsyncStorage from '@react-native-async-storage/async-storage'; // Local storage
import { moraleCategories, morales, stylesEnfantsCategories, stylesEnfants } from '@/constants/story'; // Data for story generation options

export default function CreateScreen() {
  // --- State and Variables ---

  // Profile-related state and functions
  const { profile, status, reloadProfile } = useProfileTools();
  // Plumettes (credits) management
  const nextPlumetteTimer = usePlumetteTimer(profile?.last_plumette_recharge ?? null);

  const isSubscriber = status === 'subscriber';
  const isConnected = status === 'connected';
  const isLoggedIn = isConnected || isSubscriber;

  
  const [words, setWords] = useState(['', '', '', '', '']); // Array of words entered by the user
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Selected tags (if any)
  const [popularWords, setPopularWords] = useState<string[]>([]); // Popular word suggestions
  const [loading, setLoading] = useState(false); // Loading indicator for story generation
  const [isExploding, setIsExploding] = useState(false); // Visual effect trigger
  const [modalVisible, setModalVisible] = useState(false); // Visibility of word input modal
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null); // Index of the word being edited
  const [tempWord, setTempWord] = useState(''); // Temporary word value in modal
  const [showInterstitial, setShowInterstitial] = useState(false); // Control interstitial ad display
  const [showRewarded, setShowRewarded] = useState(false); // Control rewarded ad display
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null); // Selected story theme
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null); // Selected art style
  const [becomeHeroes, setBecomeHeroes] = useState(false); // Boolean to indicate if "become heroes" mode is active
  const randomMorale = pickRandom(Object.values(moraleCategories).flat()); // Randomly selected morale
  const randomStyle = pickRandom(Object.values(stylesEnfantsCategories).flat()); // Randomly selected art style
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  // --- Refs ---

  const scrollViewRef = useRef<ScrollView | null>(null); // Ref to the scroll view
  const RewardedResolver = useRef<(rewarded: boolean) => void>(); // Ref to a promise resolver for rewarded ads

  // --- Effects ---

  // Load "becomeHeroes" setting from local storage
  useEffect(() => {
    AsyncStorage.getItem('becomeHeroes').then(value => {
      setBecomeHeroes(value === 'true');
    });
  }, []);

  // Reload user profile when the screen gains focus
  useFocusEffect(useCallback(() => { reloadProfile(); }, [reloadProfile]));

  // --- Functions ---

  // Function to handle rewarding the user (e.g., after watching an ad)
  const handleReward = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session?.access_token) return; // Ensure user is authenticated

    const res = await fetch('https://qstvlvkdzrewqqxaesho.supabase.co/functions/v1/reward-plumette', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    const result = await res.json();
    if (res.ok) {
      Alert.alert('Bravo !', 'Tu as gagné une plumette 🎉');
      reloadProfile(); // Refresh user's plumettes
    } else {
      Alert.alert('Oups...', result.error || 'Erreur inconnue');
    }
  };

  // Function to open the rewarded ad and handle its promise
  const openRewarded = () => {
    return new Promise<boolean>((resolve) => {
      RewardedResolver.current = resolve;
      setShowRewarded(true);
    });
  };

  // Main function to trigger story generation
  const triggerStoryGeneration = async () => {
    const filledWords = words.filter(w => w.trim() !== '');
    if (filledWords.length !== 5) {
      return Alert.alert('5 mots requis', 'Merci de compléter les 5 mots magiques.');
    }
  
    if (!profile?.user_id) {
      return router.push('/profile/login');
    }
  
    setIsExploding(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    setLoading(true);
    await reloadProfile();
  
    const finalMorale = selectedTheme
      ? pickRandom(moraleCategories[selectedTheme] ?? morales)
      : pickRandom(Object.values(moraleCategories).flat());
  
    const finalStyle = selectedStyle
      ? pickRandom(stylesEnfantsCategories[selectedStyle] ?? stylesEnfants)
      : pickRandom(Object.values(stylesEnfantsCategories).flat());
  
    const payload = {
      words: filledWords,
      morale: finalMorale,
      style: finalStyle,
      becomeHeroes,
    };
  
    console.log('📦 JSON envoyé à generate-story :', payload);
  
    try {
      const story = await generateStoryFromEdge(payload);
  
      router.push({
        pathname: '/story/preview',
        params: {
          title: story.title,
          content: story.content,
          illustration: story.illustration,
          words: JSON.stringify(filledWords),
        },
      });
    } catch (error: any) {
      Alert.alert('Erreur', "Une erreur est survenue lors de la génération de l'histoire.");
    } finally {
      setTimeout(() => {
        setWords(['', '', '', '', '']);
        setSelectedTags([]);
        setIsExploding(false);
        setLoading(false);
      }, 800);
    }
  };
  
  const handleAd = () => {
    setConfirmModalVisible(false);
    setShowInterstitial(true);
  };
  
  // Function to handle the overall story generation process (with input validation)
  const handleGenerateStory = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  
    const filledWords = words.filter(w => w.trim() !== '');
    const remaining = 5 - filledWords.length;
  
    if (remaining > 0) {
      return Alert.alert(
        '5 mots requis',
        `Il te manque encore ${remaining} mot${remaining > 1 ? 's' : ''} magique${remaining > 1 ? 's' : ''}.`
      );
    }
  
    if (isSubscriber) {
      triggerStoryGeneration(); // accès direct
    } else {
      setConfirmModalVisible(true); // déclenche la modale
    }
  };
  

  // Determine plumette count display
  const plumetteCount = isSubscriber
    ? '∞'
    : `${profile?.plumette_left ?? 0}`;

  // --- Render ---

  return (
    <>
      <Banner isSubscriber={isSubscriber} position="top" />

      <View style={{ flex: 1, backgroundColor: '#a19cf4' }}>
        <PlumetteBadge
          text={plumetteCount}
          onPressAdd={async () => {
            const rewarded = await openRewarded();
            if (rewarded) {
              handleReward();
            }
          }}
        />

        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
          {isSubscriber && <View style={{ height: 60, backgroundColor: '#a19cf4' }} />}

          <ImageBackground source={require('@/assets/backgrounds/dreamy-stars1.png')} style={styles.backgroundimage} resizeMode="cover">
            <Interstitial visible={showInterstitial} onClose={() => { setShowInterstitial(false); triggerStoryGeneration(); }} />
            <Rewarded
              visible={showRewarded}
              onClose={(rewarded) => {
                setShowRewarded(false);
              }}
            />


            <View style={styles.wordArea}>
              <View style={styles.cloudsContainer}>
                {words.map((word, i) => (
                  <View key={i} style={[styles.cloudWrapper, i % 2 === 1 ? styles.cloudRight : styles.cloudLeft]}>
                    <AnimatedWordBubble
                      value={word}
                      index={i}
                      isExploding={isExploding}
                      delay={i * 200}
                      onPress={() => {
                        setSelectedWordIndex(i);
                        setTempWord(word);
                        setModalVisible(true);
                      }}
                    />
                  </View>
                ))}
              </View>
            </View>

            <MagicWordModal
              visible={modalVisible}
              value={tempWord}
              onChange={setTempWord}
              onCancel={() => setModalVisible(false)}
              onConfirm={() => {
                if (selectedWordIndex !== null) {
                  const updated = [...words];
                  updated[selectedWordIndex] = tempWord;
                  setWords(updated);
                }
                setModalVisible(false);
              }}
            />

            {(isSubscriber || isConnected) && (
              <View style={styles.PickersRow}>
                <View style={styles.pickerContainer}>
                  {!isSubscriber && (<View style={{ ...StyleSheet.absoluteFillObject, zIndex: 10 }} onTouchEnd={() => Alert.alert("Fonction réservée aux abonnés", "Personnalisez votre histoire avec un thème magique.", [{ text: "Voir l'offre", onPress: () => router.push('/offres') }, { text: "Annuler", style: "cancel" }])} />)}
                  <Picker enabled={isSubscriber} selectedValue={selectedTheme} onValueChange={setSelectedTheme} style={!isSubscriber ? { opacity: 0.5 } : undefined}>
                    <Picker.Item label="— Thèmes —" value={null} />
                    {Object.keys(moraleCategories).map((cat, i) => (<Picker.Item key={i} label={cat} value={cat} />))}
                  </Picker>
                </View>

                <View style={styles.pickerContainer}>
                  {!isSubscriber && (<View style={{ ...StyleSheet.absoluteFillObject, zIndex: 10 }} onTouchEnd={() => Alert.alert("Fonction réservée aux abonnés", "Choisissez un style d’illustration magique.", [{ text: "Voir l'offre", onPress: () => router.push('/offres') }, { text: "Annuler", style: "cancel" }])} />)}
                  <Picker enabled={isSubscriber} selectedValue={selectedStyle} onValueChange={setSelectedStyle} style={!isSubscriber ? { opacity: 0.5 } : undefined}>
                    <Picker.Item label="— Styles —" value={null} />
                    {Object.keys(stylesEnfantsCategories).map((cat, i) => (<Picker.Item key={i} label={cat} value={cat} />))}
                  </Picker>
                </View>
              </View>
            )}

<TouchableOpacity
  style={styles.generateButton}
  onPress={() => {
    if (!isLoggedIn) {
      router.push('/profile/login');
    } else {
      handleGenerateStory();
    }
  }}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.generateButtonText}>
        {!isLoggedIn ? "S'inscrire pour générer une histoire" : "Créer votre histoire"}
      </Text>

      {isLoggedIn && !isSubscriber && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Text style={styles.generateButtonText}></Text>
          <Image
            source={require('@/assets/icons/plumette.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
      )}

      {isSubscriber && (
        <Text style={styles.plumetteCounterText}>(illimitée)</Text>
      )}
    </View>
  )}
</TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={() => {
              setWords(['', '', '', '', '']);
              setSelectedTags([]);
              setSelectedTheme(null);
              setSelectedStyle(null);
            }}>

              <Text style={{ fontFamily: 'Quicksand-SemiBold', fontSize: 14, color: '#6b5b51' }}>
                <Trash2 size={14} color="#333" /> Réinitialiser.
              </Text>
            </TouchableOpacity>

            <WordSelector words={words} setWords={setWords} selectedTags={selectedTags} setSelectedTags={setSelectedTags} popularWords={popularWords} setPopularWords={setPopularWords} />
          </ImageBackground>

          <View style={{ height: 60, backgroundColor: '#4a4381' }} />
          <Banner isSubscriber={isSubscriber} position="bottom" />
        </ScrollView>
      </View>
      <LoadingOverlay visible={loading} />

      {showRewarded && (
        <Rewarded
          visible={showRewarded}
          onClose={(result: boolean) => {
            if (typeof RewardedResolver.current === 'function') {
              RewardedResolver.current(result);
            }
            setShowRewarded(false);
          }}
        />
        
      )}
      <WelcomeModal />
      <ConfirmModal
  visible={confirmModalVisible}
  onCancel={() => setConfirmModalVisible(false)}
  onConfirm={handleAd}
  plumetteLeft={profile?.plumette_left ?? 0}
  lastPlumetteRecharge={profile?.last_plumette_recharge ?? null}
  goToSubscribe={() => router.push('/offres')}
/>


    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingTop: 50, paddingBottom: 0 },
  backgroundimage: { width: '100%' },
  wordArea: { padding: 60, marginTop: 250 },
  cloudsContainer: { alignItems: 'center', gap: 1 },
  cloudWrapper: { width: 350, marginVertical: -15 },
  cloudLeft: { alignSelf: 'flex-start', marginLeft: 20 },
  cloudRight: { alignSelf: 'flex-end', marginRight: 20 },
  generateButton: { backgroundColor: '#e7d7eb', borderRadius: 30, paddingVertical: 14, marginTop: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  generateButtonText: { fontFamily: 'Poppins-Bold', textAlign: 'center', fontSize: 18, color: '#000' },
  secondaryButton: { backgroundColor: '#e7d7eb', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: '#d2c2d9' },
  secondaryButtonText: { fontSize: 14, fontFamily: 'Quicksand-Regular', color: '#333' },
  plumetteCounterText: { fontSize: 18, fontFamily: 'Quicksand-Regular', color: '#000' },
  plumetteContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8, gap: 6 },
  pickerContainer: { backgroundColor: 'transparent', width: '50%', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd0c6', height: 52 },
  PickersRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginVertical: 8, paddingHorizontal: 10 },
  iconButton: { width: '30%', backgroundColor: '#e7d7eb', borderRadius: 30, paddingVertical: 10, marginTop: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  icon: { width: 14, height: 14, marginLeft: 4, },

});