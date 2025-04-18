import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState,useRef } from 'react';
import {
  View,
  ScrollView,
  ImageBackground,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { saveStoryToSupabase } from '@/hooks/historiesTools';

import { StoryCardFull } from '@/components/StoryCardFull';
import { useProfileTools } from '@/hooks/profilesTools';
import { SavedStory } from '@/hooks/historiesTools';

export default function StoryViewerScreen() {
  const params = useLocalSearchParams<{
    title: string;
    content: string;
    illustration: string;
    words?: string;
  }>();

  const [history, setHistory] = useState<SavedStory[]>([]);
  const { status } = useProfileTools();
  const isSubscriber = status === 'subscriber';
  const isConnected = status === 'connected';
  const words = params.words ? JSON.parse(params.words as string) : [];
  const savedRef = useRef(false);

  useEffect(() => {
    if (!isSubscriber || savedRef.current) return;
  
    const newStory: SavedStory = {
      id: Date.now().toString(),
      title: params.title,
      content: params.content,
      imageUrl: params.illustration,
      date: new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      words,
      isLastGenerated: true,
    };
  
    saveStoryToSupabase(newStory);
    saveAndLoadStories(newStory);
  
    savedRef.current = true;
  }, [isSubscriber]);
  
  
  

  const saveAndLoadStories = async (newStory: SavedStory) => {
    try {
      const existingStoriesJson = await AsyncStorage.getItem('stories');
      const existingStories: SavedStory[] = existingStoriesJson
        ? JSON.parse(existingStoriesJson)
        : [];
  
      // ❌ Ignore si une histoire identique (title + date) existe déjà
      const alreadyExists = existingStories.some(
        story => story.title === newStory.title && story.date === newStory.date
      );
  
      if (alreadyExists) {
        console.log('🟡 Histoire déjà enregistrée localement, ignorée.');
        setHistory(existingStories);
        return;
      }
  
      const updatedStories = [newStory, ...existingStories];
      await AsyncStorage.setItem('stories', JSON.stringify(updatedStories));
      setHistory(updatedStories);
    } catch (error) {
      console.error('Error saving or loading stories:', error);
    }
  };
  
  

  return (
    <ImageBackground
      source={require('@/assets/backgrounds/dreamy-stars1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fullCardWrapper}>
          <StoryCardFull
            variant="full"
            title={params.title}
            content={params.content}
            imageUrl={params.illustration}
            words={words}
            locked={!isSubscriber && !isConnected}
            isLastGenerated
          />
        </View>

        {history.length > 1 && (
          <>
            <Text style={styles.subTitle}>Autres histoires</Text>
            {history.slice(1).map((story) => (
              <TouchableOpacity
                key={story.id}
                activeOpacity={0.9}
                onPress={() =>
                  isSubscriber
                    ? router.push(`/story/${story.id}`)
                    : Alert.alert(
                        'Abonnement requis',
                        'Seuls les abonnés peuvent consulter toutes les histoires.',
                        [
                          { text: 'Voir les offres', onPress: () => router.push('/offres') },
                          { text: 'Annuler', style: 'cancel' },
                        ]
                      )
                }
              >
                <View style={!isSubscriber ? styles.grayscale : undefined}>
                  <StoryCardFull
                    id={story.id}
                    title={story.title}
                    date={story.date}
                    imageUrl={story.imageUrl}
                    content={story.content}
                    words={story.words}
                    locked={!isSubscriber}
                    variant="compact"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
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
    padding: 8,
    paddingTop: 8,
    paddingBottom: 60,
  },
  fullCardWrapper: {
    marginBottom: 32,
  },
  subTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#4a3f35',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  grayscale: {
    opacity: 0.4,
  },
});