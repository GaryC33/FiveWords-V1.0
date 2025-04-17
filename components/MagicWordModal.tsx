import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import { allWords } from '@/constants/story';

interface MagicWordModalProps {
  visible: boolean;
  value: string;
  onChange: (text: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function MagicWordModal({
  visible,
  value,
  onChange,
  onCancel,
  onConfirm,
}: MagicWordModalProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={value}
              onChangeText={onChange}
              placeholder="Mot magique"
              placeholderTextColor="rgba(0, 0, 0, 0.3)"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={onConfirm}
            />

          </View>

          <View style={styles.buttons}>
  <TouchableOpacity onPress={onCancel} style={styles.cancel}>
    <Text style={styles.cancelText}>Annuler</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => {
      const random = allWords[Math.floor(Math.random() * allWords.length)];
      onChange(random);
    }}
    style={styles.diceWrapper}
  >
<Image
  source={require('@/assets/images/dice.png')}
  style={styles.diceIcon1}
/>

 
  </TouchableOpacity>

  <TouchableOpacity onPress={onConfirm} style={styles.confirm}>
    <Text style={styles.confirmText}>Valider</Text>
  </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    padding: 24,
    borderRadius: 30,
    backgroundColor: '#e7d7eb',
    borderWidth: 3,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    minHeight: 100,
    overflow: 'hidden',
  },
  diceWrapper: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 8 : 10,
    marginVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#000000',
    paddingVertical: 0,
  },
  diceButton: {
    paddingLeft: 0,
  },
  diceIcon1: {
    width: 32,
    height: 32,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancel: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#fff0db',
    borderRadius: 20,
  },
  cancelText: {
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  confirm: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#fff0db',
    borderRadius: 20,
  },
  confirmText: {
    fontFamily: 'Poppins-Bold',
    color: '#000',
  },
});
