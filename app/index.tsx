import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Image,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import {
  useFonts,
  NotoSansKR_400Regular,
  NotoSansKR_700Bold,
} from '@expo-google-fonts/noto-sans-kr';
import logo from '../assets/images/logo.png';

type Role = 'student' | 'admin';
const BG = '#B6CCFE';

export default function Index() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_700Bold,
  });

  const [role, setRole] = useState<Role>('student');

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: role === 'student' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [role]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e: GestureResponderEvent, g: PanResponderGestureState) =>
        Math.abs(g.dx) > 12,
      onPanResponderRelease: (_e: GestureResponderEvent, g: PanResponderGestureState) => {
        if (g.dx < -20) setRole('admin');
        if (g.dx > 20) setRole('student');
      },
    })
  ).current;

  // 🔥 thumb 좌우 정확히 맞추기
  const thumbLeft = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 112], // 왼쪽 0, 오른쪽 끝 220-108
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DormHub</Text>

      <Image source={logo} style={styles.logoImg} resizeMode="contain" />

      <View {...panResponder.panHandlers}>
        <BlurView intensity={30} tint="light" style={styles.segment}>
          <Animated.View style={[styles.thumb, { left: thumbLeft }]} />
          <TouchableOpacity style={styles.half} activeOpacity={0.85} onPress={() => setRole('student')}>
            <Text style={[styles.optText, role === 'student' && styles.optActive]}>학생</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.half} activeOpacity={0.85} onPress={() => setRole('admin')}>
            <Text style={[styles.optText, role === 'admin' && styles.optActive]}>관리자</Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/(auth)/login', params: { role } })}
        style={styles.startWrap}
      >
        <BlurView intensity={25} tint="light" style={styles.startBtn}>
          <Text style={styles.startText}>START</Text>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontFamily: 'NotoSansKR_700Bold', fontSize: 28, color: '#fff', marginBottom: 12 },

  logoImg: { width: 400, height: 280, marginBottom: 24 },

  segment: {
    width: 220,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.28)',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  half: { width: 110, height: '100%', alignItems: 'center', justifyContent: 'center' },

  thumb: {
    position: 'absolute',
    top: '50%',
    marginTop: -19, // 중앙 정렬
    width: 108,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  optText: { fontFamily: 'NotoSansKR_400Regular', fontSize: 14, color: '#2A2A2A', opacity: 0.75 },
  optActive: { fontFamily: 'NotoSansKR_700Bold', opacity: 1 },

  startWrap: { borderRadius: 16, overflow: 'hidden' },
  startBtn: {
    paddingVertical: 16,
    paddingHorizontal: 90,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: { fontFamily: 'NotoSansKR_700Bold', fontSize: 22, letterSpacing: 2, color: '#000' },
});