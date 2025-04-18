import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

interface Props {
  visible: boolean;
}

export default function LoadingOverlay({ visible }: Props) {
  const videoRef = useRef<Video | null>(null);

  useEffect(() => {
    if (visible && videoRef.current) {
      const play = async () => {
        try {
          await videoRef.current?.playFromPositionAsync(0); // repositionnement
          await videoRef.current?.playAsync(); // déclenchement forcé
        } catch (e) {
          console.warn('🎬 Erreur playAsync:', e);
        }
      };

      play();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Video
  ref={videoRef}
  source={require('@/assets/videos/loading.mp4')}
  style={styles.video}
  resizeMode={ResizeMode.CONTAIN}
  shouldPlay
  isMuted={true} // ✅ INDISPENSABLE pour ne pas demander l'audio focus
  isLooping={false}
  onReadyForDisplay={() => console.log('🎥 Vidéo prête')}
  onPlaybackStatusUpdate={(status) => console.log('🎬 Status:', status)}
  onError={(e) => console.log('❌ Erreur vidéo :', e)}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#a39ff5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  video: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,

    marginBottom : 700
  },
});
