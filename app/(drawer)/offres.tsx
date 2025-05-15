import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
  Linking,
} from 'react-native';

import { useRouter } from 'expo-router';
import { restorePurchases } from '@/services/iap'
import { getProfile } from '@/services/supabase';
import { requestSubscription, initIAP } from '@/services/iap';

const MAX_CARD_WIDTH = 425;

type LocalProfile = {
  user_id: string;
  first_names?: string[];
  children_names?: string[];
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export default function OffresScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<LocalProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await getProfile();
        setProfile(result);
      } catch (error) {
        console.warn('⚠️ Erreur lors du chargement du profil', error);
      }
    };

    fetchProfile();
    initIAP();
  }, []);

  const handleSubscribe = async () => {
    if (!profile?.user_id) {
      Alert.alert(
        "Connexion requise",
        "Identifiez-vous pour débloquer l'aventure complète !"
      );
      return;
    }

    try {
      await requestSubscription();
    } catch (err) {
      console.error('❌ Erreur lors de l’abonnement:', err);
      Alert.alert('Erreur', "L'abonnement n'a pas pu être activé.");
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/backgrounds/dreamy-stars1.png')}
      resizeMode="cover"
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.offerList}>
          {/* 🌙 OFFRE PREMIUM */}
          <View style={[styles.offerCard, styles.cardUniform, styles.featuredCard]}>
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>✨ Offre Premium ✨</Text>

              <View style={styles.priceTag}>
                <Text style={styles.priceText}> 5,00 € / mois </Text>
              </View>

              <Text style={styles.autoRenewText}>(Renouvellement automatique)</Text>

              {[
                'Des histoires en illimitées',
                'Devenez les héros de vos histoires',
                'Thème de l’histoire personnalisable',
                'Sélection du style de l’illustration',
                'Aucune publicité',
                'Profil paramétrable',
                'Historique accessible partout',
                'Sans engagement'
              ].map((text, index) => (
                <View style={styles.bulletRow} key={index}>
                  <Image source={require('@/assets/icons/plumette.png')} style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>{text}</Text>
                </View>
              ))}

              <TouchableOpacity style={styles.ctaButton} onPress={handleSubscribe}>
                <Text style={styles.ctaButtonText}>Passez au niveau supérieur🚀</Text>
              </TouchableOpacity>
                          <TouchableOpacity
  style={styles.restoreButton}
  onPress={async () => {
    try {
      await restorePurchases();
    } catch (err) {
      Alert.alert("Erreur", "Impossible de restaurer les achats.");
    }
  }}
>
  <Text style={styles.restoreButtonText}>Restaurer mes achats</Text>
</TouchableOpacity>

            </View>
          </View>

          {/* 🕊️ OFFRE GRATUITE */}
          <View style={[styles.offerCard, styles.cardUniform]}>
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>🕊️ Offre 100% gratuite</Text>

              {[
                '5 histoires offertes à l’inscription',
                '1 plume renouvelée tous les jours',
                'Historique illimité',
                'Profil par défaut',
                'Style d’illustration par défaut',
                'Thème d’histoire par défaut',
              ].map((text, index) => (
                <View style={styles.bulletRow} key={index}>
                  <Image source={require('@/assets/icons/plumette.png')} style={styles.bulletIcon} />
                  <Text
                    style={[
                      styles.bulletText,
                      text.includes('Historique illimité') && styles.strikethrough,
                    ]}
                  >
                    {text}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => Linking.openURL('https://cinq-mots-pour-dodo.store/privacy.html')}>
          <Text style={styles.linkText}>Politique de confidentialité</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL('https://cinq-mots-pour-dodo.store/terms.html')}>
          <Text style={styles.linkText}>Conditions d’utilisation (EULA)</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#999',
    fontStyle: 'italic',
  },
  restoreButton: {
  backgroundColor: '#ffffff',
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: 30,
  alignSelf: 'center',
  marginTop: 10,
  borderWidth: 2,
  borderColor: '#007BFF',
  shadowColor: '#4a3f35',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 4,
},
restoreButtonText: {
  fontFamily: 'Poppins-Bold',
  fontSize: 20,
  textAlign: 'center',
  color: '#007BFF',
},

  scrollContent: {
    alignItems: 'center',
    paddingBottom: 60,
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  offerList: {
    gap: 16,
    width: '100%',
    maxWidth: MAX_CARD_WIDTH,
  },
  autoRenewText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 0,
    opacity: 0.9,
    alignSelf: 'center',
    marginBottom: 8,
  },
  offerCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 0,
  },
  cardUniform: {
    backgroundColor: '#fff0db',
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: '#4a3f35',
  },
  offerContent: {
    flex: 1,
    alignItems: 'flex-start',
    width: '100%',
  },
  offerTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1A1A1A',
    marginBottom: 0,
    textAlign: 'left',
    alignSelf: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    marginTop: 2,
  },
  linkText: {
    fontSize: 13,
    fontFamily: 'Quicksand-Regular',
    color: '#000',
    textAlign: 'center',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  bulletText: {
    flex: 1,
    fontFamily: 'Quicksand-Regular',
    fontSize: 15,
    color: '#4a3f35',
    lineHeight: 22,
    textAlign: 'left',
  },
  priceTag: {
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 5,
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  priceText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 10,
    shadowColor: '#4a3f35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaButtonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    textAlign: 'center',
    color: '#fff',
  },
});
