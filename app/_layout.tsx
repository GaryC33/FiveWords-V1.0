import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SafeAreaWrapper } from '@/components/SafeAreaWrapper';
import { NetworkStatus } from '@/components/NetworkStatus';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAppState } from '@/hooks/useAppState';
import { useTheme } from '@/hooks/useTheme';

export default function RootLayout() {
  useFrameworkReady();
  const { theme } = useTheme();
  const { isLoading } = useAppState();

  return (
    <ErrorBoundary>
      <SafeAreaWrapper>
        <NetworkStatus />
        <Stack 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { 
              backgroundColor: theme.colors.background 
            }
          }}
        >
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
        {isLoading && <LoadingSpinner />}
      </SafeAreaWrapper>
    </ErrorBoundary>
  );
}