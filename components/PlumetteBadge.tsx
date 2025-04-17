// components/PlumetteBadge.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { CirclePlus } from 'lucide-react-native';

interface Props {
    text: string;
    onPressAdd: () => void;
  }
  
export default function PlumetteBadge({ text, onPressAdd }: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/icons/plumette.png')}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.text}>{text} / 5</Text>
      <TouchableOpacity onPress={onPressAdd}>
        <CirclePlus color="#FFD700" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 60,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#9D88E0',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      zIndex: 1000,
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
    },
 
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    color: '#000',
    marginRight: 8,
    fontWeight: '500',
  },
});
