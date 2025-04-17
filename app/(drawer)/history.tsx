import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Alert,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { StoryCardFull } from '@/components/StoryCardFull';
import  EmptyStateIllustration  from '@/components/EmptyStateIllustration';
import { SavedStory, getLocalHistory } from '@/hooks/historiesTools';
import { useProfileTools } from '@/hooks/profilesTools';
import { router } from 'expo-router';
import Interstitial from '@/app/admob/Interstitial';
import Banner from '@/app/admob/Banner';
export default function HistoryScreen() {
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [pendingStoryId, setPendingStoryId] = useState<string | null>(null);

  const { status } = useProfileTools();
  const isSubscriber = status === 'subscriber';
  const isConnected = status === 'connected';

  useEffect(() => {
    loadLocalStories();
  }, []);

  const loadLocalStories = async () => {
    const local = await getLocalHistory();
    setStories(local);
  };

  // ✅ déclenche navigation APRES la pub interstitielle
  useEffect(() => {
    if (!showInterstitial && pendingStoryId) {
      router.push(`/story/${pendingStoryId}`);
      setPendingStoryId(null);
    }
  }, [showInterstitial, pendingStoryId]);

  const handleStoryPress = (id: string, isLast: boolean) => {
    if (isSubscriber) {
      router.push(`/story/${id}`);
    } else if (isConnected && isLast) {
      setPendingStoryId(id);
      setShowInterstitial(true);
    } else {
      Alert.alert(
        "Abonnement requis",
        "Les abonnés ont accès à toutes les histoires.",
        [
          { text: "Voir les offres", onPress: () => router.push('/offres') },
          { text: "Annuler", style: "cancel" },
        ]
      );
    }
  };

  return (
        <>
<Banner isSubscriber={status === 'subscriber'} position="top" />

    <ImageBackground
      source={require('@/assets/backgrounds/dreamy-stars1.png')}
      resizeMode="cover"
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mes histoires</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => router.push('/')}>
            <Sparkles size={20} color="#fff" />
            <Text style={styles.createButtonText}>Lancer une nouvelle histoire</Text>
          </TouchableOpacity>
        </View>

        {stories.length === 0 ? (
          <View style={styles.emptyState}>
            <EmptyStateIllustration />
            <Text style={styles.emptyStateText}>
              Vous n'avez pas encore créé d'histoire magique...
            </Text>
            <Text style={styles.emptyStateSubtext}>
            5 mots suffisent pour faire naître une histoire…
            </Text>
          </View>
        ) : (
          <View style={styles.storiesList}>
            {stories.map((story, index) => {
              const locked = !isSubscriber && !(isConnected && story.isLastGenerated);

              return (
                <TouchableOpacity
                  key={story.id}
                  activeOpacity={0.9}
                  onPress={() => handleStoryPress(story.id, story.isLastGenerated === true)}
                >
                  <View style={locked ? styles.grayscale : undefined}>
                    <StoryCardFull
                      id={story.id}
                      title={story.title}
                      date={story.date}
                      imageUrl={story.imageUrl}
                      content={story.content}
                      words={story.words ?? []}
                      variant="compact"
                      locked={locked}
                      isLastGenerated={story.isLastGenerated === true}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ✅ Popup pub  */}
        <Interstitial
          visible={showInterstitial}
          onClose={() => setShowInterstitial(false)}
        />
      </ScrollView>
    </ImageBackground>
    <Banner isSubscriber={status === 'subscriber'} position="bottom" />

          </>
  );
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#e9e1d6',
  },
  grayscale: {
    opacity: 0.4,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 70,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    color: '#6b5b51',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ac9fb1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6b5b51',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Quicksand-SemiBold',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(107, 91, 81, 0.7)',
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular',
  },
  storiesList: {
    marginTop: 16,
    gap: 16,
  },
});
