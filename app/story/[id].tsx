import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ScrollView, ImageBackground } from 'react-native';
import { loadLocalStory } from '@/hooks/historiesTools';
import { StoryCardFull } from '@/components/StoryCardFull';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [story, setStory] = useState<{
    id?: string;
    title: string;
    content: string;
    imageUrl: string;
    words?: string[];
    date?: string;
  } | null>(null);

  useEffect(() => {
    if (id) {
      loadLocalStory(String(id)).then((s) => {
        if (s) setStory(s);
      });
    }
  }, [id]);

  if (!story) return null;

  return (
    <ImageBackground
      source={require('@/assets/backgrounds/dreamy-stars1.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <StoryCardFull
          id={story.id}
          title={story.title}
          content={story.content}
          imageUrl={story.imageUrl}
          words={story.words ?? []}
          variant="full" // ✅ version complète
        />
      </ScrollView>
    </ImageBackground>
  );
}
