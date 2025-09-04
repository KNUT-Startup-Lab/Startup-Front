// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/state/AuthContext';
import { useFonts, NotoSansKR_400Regular, NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr';

export default function RootLayout() {
  const [loaded] = useFonts({ NotoSansKR_400Regular, NotoSansKR_700Bold });
  if (!loaded) return null;
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown:false, contentStyle:{ backgroundColor:'#B6CCFE' } }} />
    </AuthProvider>
  );
}