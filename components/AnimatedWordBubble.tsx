import React, { useRef, useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Easing,
  Text,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

interface WordCloudProps {
  value: string;
  onPress: () => void;
  index: number;
  isExploding: boolean;
  delay: number;
  opacity?: number;

}

export default function AnimatedWordBubble({
  value,
  onPress,
  index,
  isExploding,
  delay,
}: WordCloudProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const popAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200 + index * 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200 + index * 100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isExploding) {
      // D’abord : vibration rapide gauche-droite
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 50,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),

        // Ensuite : zoom puis disparition
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(popAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
      popAnim.setValue(1);
      shakeAnim.setValue(0);
    }
  }, [isExploding]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  const translateX = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-5, 5],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY },
            { translateX },
            { scale: Animated.multiply(scaleAnim, popAnim) },
          ],
          opacity: popAnim,
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <ImageBackground
          source={require('@/assets/images/cloud.png')}
          style={styles.cloud}
          imageStyle={{ resizeMode: 'contain' }}
          
        >
          <Text style={[styles.wordText, value.trim() === '' && styles.wordSuggestionText]}>
            {value.trim() === '' ? `Mot\nmagique ${index + 1}` : value}
          </Text>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
    alignSelf: 'center',
  },
  cloud: {
    width: 300,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    opacity : 1
  },
  wordText: {
    fontSize: 16,
    color: '#5f57a2',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  wordSuggestionText: {
    color: '#c8c2fd',
    fontSize: 14,
  },
});
