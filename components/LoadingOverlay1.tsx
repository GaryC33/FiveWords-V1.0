import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface Props {
  visible: boolean;
}

export default function LoadingOverlay({ visible }: Props) {
  const videoRef = useRef<Video | null>(null);
  const [isVisible, setIsVisible] = useState(visible);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      fadeAnim.setValue(0);
  
      // Animation d'apparition
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
  
      // Rejoue la vidéo depuis le début
      videoRef.current?.playFromPositionAsync(0);
  
      // Masquer après 15 secondes
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 16000);
    }
  
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);
  
  
  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish && !status.isLooping) {
      setTimeout(() => setIsVisible(false), 200);
    }
  };

  if (!isVisible) return null;

  return (
<Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
<Video
        ref={videoRef}
        source={require('../assets/videos/loading.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}

        
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60, // ou ajustable selon ta UI
    backgroundColor: 'rgba(240, 240, 255, 0.2)', // bleu-lavande très pâle
    alignItems: 'center',
    zIndex: 999,
  },
  video: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    borderRadius: 24,
    overflow: 'hidden',
  },
});
