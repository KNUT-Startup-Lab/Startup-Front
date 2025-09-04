// app/settings/_layout.tsx  (보호 레이아웃)
import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../src/state/AuthContext';

export default function SettingsLayout() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Redirect href="/auth/login" />;
  return <Stack screenOptions={{ headerShown:true, headerTitleAlign:'center', headerTitleStyle:{ fontFamily:'NotoSansKR_700Bold' } }} />;
}