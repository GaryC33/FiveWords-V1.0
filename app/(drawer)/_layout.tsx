///app/(drawer)/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import {
  StyleSheet,
  Image,
  View,
  ImageBackground,
} from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { colors } from '@/constants/colors';


export default function DrawerLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground
        source={require('@/assets/backgrounds/dreamy-stars1.png')}
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
              <View style={{ paddingTop: 40 }}>
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
              <Image
                source={require('@/assets/icons/plumette.png')
                  
                }
                style={{ width: 20, height: 20 }}
              />
            ),
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel: 'Accueil',
              title: '',
            }}
          />

          <Drawer.Screen
            name="offres"
            options={{
              drawerLabel: 'Nos offres',
              title: '',
            }}
          />
          <Drawer.Screen
            name="history"
            options={{
              drawerLabel: 'Historique',
              title: '',
            }}
          />
          <Drawer.Screen
            name="user-auth-tab"
            options={{
              drawerLabel: 'Compte',
              title: '',
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
});
