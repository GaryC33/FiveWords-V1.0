//app/(drawer)/user-auth-tab.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/services/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function AuthRedirectTab() {
  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/profile/profile');

      } else {
        router.replace('/profile/login');
      }
    };

    checkSessionAndRedirect();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
