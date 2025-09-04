import React from 'react';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE = '#D6DDFF';
const ACTIVE = '#2C6DF7';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTransparent: true,
        headerTitle: '',
        headerBackground: () => <BlurView intensity={12} tint="light" style={StyleSheet.absoluteFill} />,

        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: '#7B8AA4',

        // 시스템 기본 배경/보더 제거(흰색 누수 방지)
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          height: 64,
          borderTopWidth: 0,
          backgroundColor: 'transparent', // ← 투명
          elevation: 0,
        },

        // 커스텀 글래스 배경(라운드+클리핑)
        tabBarBackground: () => (
          <View style={styles.tabGlassWrap}>
            <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reservation"
        options={{
          title: 'Reservation',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: 'My Page',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabGlassWrap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(214,221,255,0.92)', // BASE 글래스
  },
});