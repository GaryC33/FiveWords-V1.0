//app/(drawer)/_layout.tsx
// Dépendances React & React Native
import { useEffect, useState } from 'react';
import { StyleSheet, Image, View, ImageBackground } from 'react-native';

// Composant de navigation Drawer (expo-router)
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';

// Nécessaire pour les gestes dans le drawer (glisser-ouvrir)
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Supabase (authentification)
import { supabase } from '@/services/supabase';

// Couleurs centralisées dans le projet
import { colors } from '@/constants/colors';

// Assets importés une seule fois pour lisibilité et maintenabilité
const BACKGROUND_IMAGE = require('@/assets/backgrounds/dreamy-stars1.png');
const ICON_PLUMETTE = require('@/assets/icons/plumette.png');

export default function DrawerLayout() {
  // État local pour savoir si l'utilisateur est connecté
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Fonction initiale pour vérifier si une session est déjà active
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    initAuth();

    // Écoute les changements d'état de connexion (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    // Nettoyage du listener lors du démontage du composant
    return () => {
      subscription?.unsubscribe?.(); // Sécurisé même si undefined
    };
  }, []);

  return (
    // Racine nécessaire pour les gestes dans l’application
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Image de fond étoilée sur toute la hauteur */}
      <ImageBackground
        source={BACKGROUND_IMAGE}
        resizeMode="cover"
        style={styles.background}
      >
        {/* Composant Drawer avec options globales pour tous les écrans */}
        <Drawer
          screenOptions={{
            headerTransparent: true, // En-tête sans fond opaque
            headerStyle: {
              backgroundColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: colors.pearlWhite, // Couleur du texte/icônes
            headerLeft: ({ tintColor }) => (
              <View style={styles.headerLeft}>
                <DrawerToggleButton tintColor={tintColor} />
              </View>
            ),
            drawerStyle: {
              backgroundColor: '#e7d7eb',
              borderTopRightRadius: 30,
              borderBottomRightRadius: 30,
              width: 230,
              paddingTop: 40,
            },
            drawerLabelStyle: {
              fontFamily: 'Poppins-Bold',
              color: colors.nightBlue,
            },
            drawerIcon: () => (
              <Image source={ICON_PLUMETTE} style={styles.drawerIcon} />
            ),
          }}
        >
          {/* Liste des écrans du menu Drawer */}
          <Drawer.Screen name="index" options={{ drawerLabel: 'Accueil', title: '' }} />
          <Drawer.Screen name="offres" options={{ drawerLabel: 'Nos offres', title: '' }} />
          <Drawer.Screen name="history" options={{ drawerLabel: 'Historique', title: '' }} />
          <Drawer.Screen name="user-auth-tab" options={{ drawerLabel: 'Compte', title: '' }} />
        </Drawer>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

// Feuille de styles pour le composant
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#e7d7eb', // Couleur de fond visible avant le chargement de l’image
  },
  headerLeft: {
    paddingTop: 40, // Espacement manuel en haut pour éviter l'encoche (peut être remplacé par SafeAreaView)
  },
  drawerIcon: {
    width: 20,
    height: 20,
  },
});
