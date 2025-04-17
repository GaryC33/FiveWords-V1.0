import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, Platform } from 'react-native';

const COLORS = [
  '#000'
];

interface RainbowWavyWordProps {
  word: string;
  index: number;
}

export default function RainbowWavyWord({ word, index }: RainbowWavyWordProps) {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: -6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 6,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const color = COLORS[index % COLORS.length];

  return (
    <Animated.Text
      style={[
        styles.word,
        {
          transform: [{ translateY: animation }],
          color,
        },
      ]}
    >
      {word}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  word: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Quicksand-Bold' : 'Quicksand-Bold',
    textAlign: 'center',
    marginHorizontal: 6,
  },
});
