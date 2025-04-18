import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { X, Share2, BookOpen, Lock, Download } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase, isSubscriber } from '@/services/supabase';

// Retiré : import RainbowWavyWord

type Variant = 'full' | 'compact';

interface StoryCardFullProps {
  id?: string;
  title: string;
  date?: string;
  content: string;
  imageUrl: string;
  words?: string[];
  locked?: boolean;
  onSave?: () => void;
  variant: Variant;
  isLastGenerated?: boolean;
}

export function StoryCardFull({
  id,
  title,
  date,
  content,
  imageUrl,
  words = [],
  locked = false,
  onSave,
  variant,
  isLastGenerated = false,
}: StoryCardFullProps) {
  const [profile, setProfile] = useState<{
    first_names: string[];
    children_names: string[];
    current_period_end?: string | null;
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_names, children_names, current_period_end')
            .eq('user_id', user.id)
            .single();
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  const userIsSubscriber = isSubscriber(profile?.current_period_end);
  const canRead = !locked || userIsSubscriber || isLastGenerated;

  const handleShare = async () => {
    try {
      const parentNames = profile?.first_names?.length
        ? profile.first_names.join(' & ')
        : null;
  
      const childNames = profile?.children_names?.length
        ? profile.children_names.join(' & ')
        : null;
  
      const motsStr = words && words.length > 0 ? ` (mots : ${words.join(', ')})` : '';
  
      const footer = parentNames && childNames
        ? `Histoire créée avec 5 mots pour dodo par ${parentNames} & ${childNames}${motsStr}`
        : parentNames
        ? `Histoire créée avec 5 mots pour dodo par ${parentNames}${motsStr}`
        : childNames
        ? `Histoire créée par ${childNames}${motsStr}`
        : `Histoire créée avec 5 mots pour dodo${motsStr}`;
  
      const appLink = '\n\nDécouvrir l’app : https://cinq-mots-pour-dodo.store/app.html';
  
      const fullText = `${title}\n\n${content.trim()}\n\n${footer}${appLink}`;
  
      await Share.share({ message: fullText });
    } catch (error) {
      console.error('❌ Erreur de partage :', error);
    }
  };
  

  const handleRead = () => {
    if (!canRead) {
      Alert.alert(
        'Abonnement requis',
        'Seule la dernière histoire est accessible sans abonnement.',
        [{ text: 'Voir les offres', onPress: () => router.push('/offres') }]
      );
      return;
    }

    if (id) {
      router.push({ pathname: '/story/[id]', params: { id } });
    }
  };

  const handleClose = () => {
    router.back();
  };

  const getFooterText = () => {
    const parentNames = profile?.first_names?.length
      ? profile.first_names.join(' & ')
      : null;
  
    const childNames = profile?.children_names?.length
      ? profile.children_names.join(' & ')
      : null;
      const motsStr = words && words.length > 0 ? ` (mots : ${words.join(', ')})` : '';

if (parentNames && childNames) {
    return `Histoire créée avec 5 mots pour dodo par ${parentNames} & ${childNames}${motsStr}`;
  } else if (parentNames) {
    return `Histoire créée avec 5 mots pour dodo par ${parentNames}${motsStr}`;
  } else if (childNames) {
    return `Histoire créée par ${childNames}${motsStr}`;
  } else {
    return `Histoire créée avec 5 mots pour dodo${motsStr}`;
  }
};
  

  const highlightWordsInText = (text: string, keywords: string[]) => {
    const sortedWords = [...keywords].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`(${sortedWords.join('|')})(?!\\w)`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, index) => {
      const isMatch = sortedWords.some(word => word.toLowerCase() === part.toLowerCase());
      return (
        <Text
          key={index}
          style={[styles.paragraph, isMatch && { fontWeight: 'bold', fontFamily: 'Quicksand-Bold' }]}
        >
          {part}
        </Text>
      );
    });
  };

  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  if (variant === 'compact') {
    return (
      <View style={[styles.card, locked && !canRead && styles.cardLocked]}>
        <TouchableOpacity onPress={handleRead} activeOpacity={!canRead ? 1 : 0.8}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          {locked && !canRead && (
            <View style={styles.lockOverlay}>
              <Lock color="#fff" size={32} />
              <Text style={styles.lockText}>Réservé aux abonnés</Text>
            </View>
          )}
          {isLastGenerated && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>🆕 Nouvelle histoire</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.contentCompact}>
          <Text style={styles.title}>{title}</Text>
          {date && <Text style={styles.date}>{date}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleRead} disabled={!canRead}>
              <BookOpen size={20} color={!canRead ? '#aaa' : '#4a3f35'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Share2 size={20} color="#4a3f35" />
            </TouchableOpacity>
            {onSave && (
              <TouchableOpacity onPress={onSave}>
                <Download size={20} color="#4a3f35" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.roundButton}>
            <X size={20} color="#6b5b51" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.roundButton}>
            <Share2 size={20} color="#6b5b51" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Image source={{ uri: imageUrl }} style={styles.illustration} />

        <View style={styles.contentBox}>
          {paragraphs.map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {highlightWordsInText(p, words)}
            </Text>
          ))}
        </View>

        <View style={styles.footer}>
          <Image
            source={{ uri: 'https://i.ibb.co/fd29RKyt/icon.png' }}
            style={styles.footerIcon}
          />
          <Text style={styles.footerText}>{getFooterText()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 8,
    paddingTop: 60,
  },
  card: {
    backgroundColor: '#fdfcfb',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#6b5b51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 0,
    marginBottom: 24,
  },
  cardLocked: {
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  roundButton: {
    backgroundColor: '#f7f3ef',
    padding: 10,
    borderRadius: 20,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#4a3f35',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Quicksand-Regular',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  illustration: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    marginBottom: 24,
  },
  contentCompact: {
    padding: 16,
  },
  contentBox: {
    backgroundColor: '#f1ebe4',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  paragraph: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    lineHeight: 26,
    color: '#6b5b51',
    marginBottom: 16,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockText: {
    color: '#fff',
    marginTop: 8,
    fontFamily: 'Quicksand-SemiBold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd0c6',
  },
  footerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  footerText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#6b5b51',
    opacity: 0.7,
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#f9d7ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  newBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: '#6b5b51',
  },
});
