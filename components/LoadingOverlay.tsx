import React from 'react';
import { View, StyleSheet, Dimensions, Image } from 'react-native';

interface Props {
  visible: boolean;
}

export default function LoadingOverlay({ visible }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Image
        source={require('@/assets/gifs/loading.gif')}
        style={styles.image}
        resizeMode="contain"
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
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
    marginBottom: 50,
  },
});
