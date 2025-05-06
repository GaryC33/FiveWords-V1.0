//app/(drawer)/history.tsx
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';

import { Sparkles } from 'lucide-react-native';
import { StoryCardFull } from '@/components/StoryCardFull';
import EmptyStateIllustration from '@/components/EmptyStateIllustration';
import { SavedStory, getLocalHistory } from '@/hooks/historiesTools';
import { useProfileTools } from '@/hooks/profilesTools';
import { router } from 'expo-router';

import Interstitial from '@/app/admob/Interstitial';
import Banner from '@/app/admob/Banner';

export default function HistoryScreen() {
  // Histoires récupérées en local
  const [stories, setStories] = useState<SavedStory[]>([]);

  // Contrôle de la pub interstitielle
  const [showInterstitial, setShowInterstitial] = useState(false);

  // Stocke temporairement l’ID de l’histoire sélectionnée
  const [pendingStoryId, setPendingStoryId] = useState<string | null>(null);

  // Statut du profil
  const { status } = useProfileTools();
  const isSubscriber = status === 'subscriber';
  const isConnected = status === 'connected';

  // Chargement initial des histoires locales
  useEffect(() => {
    const loadLocalStories = async () => {
      const local = await getLocalHistory();
      setStories(local);
    };
    loadLocalStories();
  }, []);

  // Une fois la pub fermée, on navigue vers l’histoire demandée
  useEffect(() => {
    if (!showInterstitial && pendingStoryId) {
      router.push(`/story/${pendingStoryId}`);
      setPendingStoryId(null);
    }
  }, [showInterstitial, pendingStoryId]);

  // Gestion du clic sur une histoire
  const handleStoryPress = (id: string, isLast: boolean) => {
    if (isSubscriber) {
      // Accès libre
      router.push(`/story/${id}`);
    } else if (isConnected && isLast) {
      // Dernière histoire accessible aux non-abonnés
      setPendingStoryId(id);
      setShowInterstitial(true);
    } else {
      // Verrouillé → incitation à l’abonnement
      Alert.alert(
        'Abonnement requis',
        'Pour explorer toutes vos histoires magiques, devenez explorateur abonné !',
        [
          { text: 'Voir les offres', onPress: () => router.push('/offres') },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <>
      {/* Publicité bannière (top) */}
      <Banner isSubscriber={isSubscriber} position="top" />

      <ImageBackground
        source={require('@/assets/backgrounds/dreamy-stars1.png')}
        resizeMode="cover"
        style={styles.background}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* En-tête de page */}
          <View style={styles.header}>
            <Text style={styles.title}>Mes histoires</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/')}
            >
              <Sparkles size={20} color="#fff" />
              <Text style={styles.createButtonText}>Lancer une nouvelle histoire</Text>
            </TouchableOpacity>
          </View>

          {/* Aucune histoire : état vide */}
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
            // Liste des histoires
            <View style={styles.storiesList}>
              {stories.map((story) => {
                const locked =
                  !isSubscriber && !(isConnected && story.isLastGenerated);

                return (
                  <TouchableOpacity
                    key={story.id}
                    activeOpacity={0.9}
                    onPress={() =>
                      handleStoryPress(story.id, story.isLastGenerated === true)
                    }
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

          {/* Popup de publicité interstitielle (non-abonné) */}
          <Interstitial
            visible={showInterstitial}
            onClose={() => setShowInterstitial(false)}
          />
        </ScrollView>
      </ImageBackground>

      {/* Publicité bannière (bottom) */}
      <Banner isSubscriber={isSubscriber} position="bottom" />
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#e9e1d6',
  },
  grayscale: {
    opacity: 0.4, // Effet visuel pour signaler le verrouillage
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
