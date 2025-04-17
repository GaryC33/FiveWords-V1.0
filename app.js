import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Button } from 'react-native';
import { createCipheriv, createDecipheriv, randomBytes } from 'react-native-crypto';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [encryptionKey, setEncryptionKey] = useState('');
  const [initializationVector, setInitializationVector] = useState('');

  const generateKeyAndIV = () => {
    const key = randomBytes(32).toString('hex'); // Clé de 256 bits (32 octets)
    const iv = randomBytes(16).toString('hex'); // Vecteur d'initialisation de 128 bits (16 octets)
    setEncryptionKey(key);
    setInitializationVector(iv);
    alert('Clé et IV générés ! (Conservez-les précieusement)');
  };

  const encryptData = () => {
    if (!inputText || !encryptionKey || !initializationVector) {
      alert('Veuillez entrer du texte, générer une clé et un IV.');
      return;
    }

    try {
      const cipher = createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.from(initializationVector, 'hex'));
      let encrypted = cipher.update(inputText, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      setEncryptedText(encrypted);
      setDecryptedText(''); // Effacer le texte déchiffré
    } catch (error) {
      alert('Erreur lors du chiffrement : ' + error.message);
    }
  };

  const decryptData = () => {
    if (!encryptedText || !encryptionKey || !initializationVector) {
      alert('Veuillez entrer du texte chiffré, une clé et un IV.');
      return;
    }

    try {
      const decipher = createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.from(initializationVector, 'hex'));
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      setDecryptedText(decrypted);
    } catch (error) {
      alert('Erreur lors du déchiffrement : ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Texte à chiffrer/déchiffrer :</Text>
      <TextInput
        style={styles.input}
        onChangeText={setInputText}
        value={inputText}
        placeholder="Entrez votre texte"
      />

      <Button title="Générer Clé et IV" onPress={generateKeyAndIV} />

      {encryptionKey && (
        <View>
          <Text>Clé de chiffrement : {encryptionKey}</Text>
          <Text>Vecteur d'initialisation : {initializationVector}</Text>
        </View>
      )}

      <Button title="Chiffrer" onPress={encryptData} />

      {encryptedText && (
        <View>
          <Text>Texte chiffré : {encryptedText}</Text>
        </View>
      )}

      <Button title="Déchiffrer" onPress={decryptData} />

      {decryptedText && (
        <View>
          <Text>Texte déchiffré : {decryptedText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
});