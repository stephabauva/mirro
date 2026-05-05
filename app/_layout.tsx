import {
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { AppStateProvider } from '@/contexts/app-state';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#090b12',
    card: '#13111a',
    text: '#f8f1e8',
    primary: '#e7c793',
    border: 'rgba(255,255,255,0.12)',
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    SpecialElite_400Regular,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppStateProvider>
      <ThemeProvider value={theme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#090b12',
            },
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="oracle/[persona]" />
          <Stack.Screen name="archive" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="legal/privacy" />
          <Stack.Screen name="legal/terms" />
          <Stack.Screen name="legal/refunds" />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </AppStateProvider>
  );
}
