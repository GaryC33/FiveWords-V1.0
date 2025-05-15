import { useEffect, useState } from 'react';
import { StyleSheet, Image, View, ImageBackground } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '@/services/supabase';
import { colors } from '@/constants/colors';

const BACKGROUND_IMAGE = require('@/assets/backgrounds/dreamy-stars1.png');
const ICON_PLUMETTE = require('@/assets/icons/plumette.png');

export default function DrawerLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    initAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={BACKGROUND_IMAGE}
        resizeMode="cover"
        style={styles.background}
      >
        <Drawer
          screenOptions={{
            headerTransparent: true,
            headerStyle: {
              backgroundColor: 'transparent',
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: colors.pearlWhite,
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
            swipeEnabled: true,
            swipeEdgeWidth: 100,
          }}
        >
          <Drawer.Screen 
            name="index" 
            options={{ 
              drawerLabel: 'Accueil',
              title: '',
              drawerItemStyle: { marginVertical: 5 }
            }} 
          />
          <Drawer.Screen 
            name="offres" 
            options={{ 
              drawerLabel: 'Nos offres',
              title: '',
              drawerItemStyle: { marginVertical: 5 }
            }} 
          />
          <Drawer.Screen 
            name="history" 
            options={{ 
              drawerLabel: 'Historique',
              title: '',
              drawerItemStyle: { marginVertical: 5 }
            }} 
          />
          <Drawer.Screen 
            name="user-auth-tab" 
            options={{ 
              drawerLabel: 'Compte',
              title: '',
              drawerItemStyle: { marginVertical: 5 }
            }} 
          />
        </Drawer>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#e7d7eb',
  },
  headerLeft: {
    paddingTop: 40,
  },
  drawerIcon: {
    width: 20,
    height: 20,
  },
});