import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useFonts as usePoppins, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useFonts as useQuicksand, Quicksand_400Regular } from '@expo-google-fonts/quicksand';


import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { supabase } from '@/services/supabase';

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Nunito-Regular': Nunito_400Regular,
    'Nunito-SemiBold': Nunito_600SemiBold,
    'Nunito-Bold': Nunito_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Bold': Poppins_700Bold,
    'Quicksand-Regular': Quicksand_400Regular,
  });

  // Écoute les changements d’authentification (facultatif mais conservé)
  React.useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🌀 Auth state changed:', event);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Si les polices ne sont pas prêtes, ne rien afficher
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
