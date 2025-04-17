import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

export default function EmptyStateIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.cloud}>
        <View style={styles.moon} />
        <View style={styles.star1} />
        <View style={styles.star2} />
      </View>
      <View style={styles.book}>
        <View style={styles.bookCover} />
        <View style={styles.bookPages} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  cloud: {
    width: 120,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    position: 'relative',
    marginBottom: 20,
  },
  moon: {
    position: 'absolute',
    width: 40,
    height: 40,
    backgroundColor: colors.softPurple,
    borderRadius: 20,
    top: 10,
    left: 20,
  },
  star1: {
    position: 'absolute',
    width: 15,
    height: 15,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    top: 5,
    right: 20,
  },
  star2: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#FFD700',
    borderRadius: 5,
    bottom: 10,
    right: 35,
  },
  book: {
    width: 80,
    height: 100,
    position: 'relative',
  },
  bookCover: {
    width: 80,
    height: 100,
    backgroundColor: colors.softPurple,
    borderRadius: 8,
    position: 'absolute',
  },
  bookPages: {
    width: 70,
    height: 90,
    backgroundColor: colors.pearlWhite,
    borderRadius: 4,
    position: 'absolute',
    top: 5,
    left: 5,
  },
});