// ─────────────────────────────────────────────────────────────
// Composant WordSelector — sélection et affichage des mots populaires
// Permet à l’utilisateur de choisir jusqu’à 5 mots pour générer une histoire
// ─────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RefreshCcw } from 'lucide-react-native';
import { allWords } from '@/constants/story';
import AnimatedWordBubble from '@/components/AnimatedWordBubble';

interface Props {
  words: string[];
  setWords: (w: string[]) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  setPopularWords: (words: string[]) => void;
  popularWords: string[];
}

// ─────────────────────────────────────────────────────────────
// Fonction utilitaire : tire 5 mots au hasard dans allWords
// ─────────────────────────────────────────────────────────────

const getRandomWords = (count: number) => {
  const shuffled = [...allWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// ─────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────

export const WordSelector: React.FC<Props> = ({
  words,
  setWords,
  selectedTags,
  setSelectedTags,
  popularWords,
  setPopularWords,
}) => {
  // Initialisation des mots populaires
  useEffect(() => {
    setPopularWords(getRandomWords(5));
  }, []);

  // Mise à jour manuelle d’un mot à un index donné
  const updateWord = (index: number, word: string) => {
    const newWords = [...words];
    newWords[index] = word;
    setWords(newWords);
  };

  // Ajoute/enlève un mot du tableau selectedTags (max 5)
  const toggleTag = (word: string) => {
    if (selectedTags.includes(word)) {
      setSelectedTags(selectedTags.filter(tag => tag !== word));
    } else if (selectedTags.length < 5) {
      setSelectedTags([...selectedTags, word]);
      const emptyIndex = words.findIndex(w => !w);
      if (emptyIndex !== -1) updateWord(emptyIndex, word);
    }
  };

  return (
    <View style={styles.container}>
      {/* Titre + bouton refresh */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Mots populaires : </Text>
        <TouchableOpacity
          onPress={() => setPopularWords(getRandomWords(5))}
          style={styles.refreshButton}
        >
          <RefreshCcw size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Grille de mots animés */}
      <View style={styles.grid}>
        {[0, 1].map(row => (
          <View key={row} style={styles.row}>
            {[0, 1, 2].map(col => {
              const index = row * 3 + col;
              const word = popularWords[index];
              if (!word) return null;

              return (
                <View key={index} style={styles.bubbleWrapper}>
                  <AnimatedWordBubble
                    value={word}
                    index={index}
                    isExploding={false}
                    delay={index * 100}
                    onPress={() => toggleTag(word)}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Styles inline organisés par section
// ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginBottom: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 18,
    color: '#000',
  },
  refreshButton: {
    backgroundColor: '#f2e8f5',
    padding: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#d2c2d9',
  },
  grid: {
    alignItems: 'center',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 12,
  },
  bubbleWrapper: {
    transform: [{ scale: 0.7 }],
    width: 100,
    height: 40,
  },
});
