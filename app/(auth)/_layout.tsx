// app/auth/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerShown:true,
      headerTitleAlign:'center',
      headerTintColor:'#222',
      headerTitleStyle:{ fontFamily:'NotoSansKR_700Bold' },
      contentStyle:{ backgroundColor:'#F5F7FB' },
    }}/>
  );
}