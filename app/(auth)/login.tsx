// app/(auth)/login.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, Alert,
  KeyboardAvoidingView, Platform, StyleSheet, Animated, Easing, ScrollView
} from 'react-native';
import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';

const BASE = '#D6DDFF';
const GLASS = 'rgba(255,255,255,0.55)';
const GLASS_BORDER = 'rgba(255,255,255,0.65)';
const TINT = '#2C6DF7';
const TEXT_DARK = '#20263A';

export default function LoginScreen() {
  const { role = 'student' } = useLocalSearchParams<{ role?: 'student' | 'admin' }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 애니메이션
  const fadeIn = useRef(new Animated.Value(0)).current;
  const float1 = useRef(new Animated.Value(0)).current;
  const float2 = useRef(new Animated.Value(0)).current;
  const sheen = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 550, useNativeDriver: true, easing: Easing.out(Easing.cubic) }).start();
    const floating = (v: Animated.Value, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 3200, delay, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
          Animated.timing(v, { toValue: 0, duration: 3200, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
        ])
      ).start();
    floating(float1, 300);
    floating(float2, 1200);

    Animated.loop(
      Animated.sequence([
        Animated.timing(sheen, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(sheen, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const onLogin = async () => {
    if (!email.trim() || !password.trim()) return Alert.alert('알림', '이메일과 비밀번호를 입력해 주세요.');
    if (loading) return;
    setLoading(true);
    try {
      // 임시 로그인: 이메일/비밀번호 모두 "1"이면 바로 통과
      if (email === '1' && password === '1') {
        await AsyncStorage.multiSet([
          ['accessToken', 'dummy-token'],
          ['refreshToken', 'dummy-refresh-token'],
          ['userEmail', role === 'admin' ? 'admin@test.com' : 'student@test.com'],
          ['userId', role === 'admin' ? 'admin-001' : 'student-001'],
          ['userName', role === 'admin' ? '관리자' : '학생'],
        ]);
        router.replace('/(tabs)');
        return;
      }

      // 기존 API 로그인 (주석처리됨)
      /*
      const res = await api<{ user_id: string; email: string; name?: string; accessToken: string; refreshToken: string }>(
        '/api/auth/login',
        { method: 'POST', body: { email, password } }
      );
      await AsyncStorage.multiSet([
        ['accessToken', res.accessToken],
        ['refreshToken', res.refreshToken],
        ['userEmail', res.email],
        ['userId', res.user_id],
        ['userName', res.name ?? ''],
      ]);
      router.replace('/(tabs)');
      */

      Alert.alert('알림', '현재는 이메일/비밀번호에 "1"을 입력해주세요.');
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  const goSignup = () =>
    role === 'admin' ? router.push('/(auth)/signup-admin') : router.push('/(auth)/signup-student');

  // 부드러운 떠다니기
  const float = (v: Animated.Value, amp = 10) => ({
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -amp] }) }],
    opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
  });

  // 버튼 샤이닝
  const sheenStyle = {
    opacity: sheen.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.6, 0] }),
    transform: [
      { translateX: sheen.interpolate({ inputRange: [0, 1], outputRange: [-220, 220] }) },
      { rotate: '-20deg' as any },
    ],
  };

  // --- 역할 뱃지 표시용 ---
  const roleLabel = role === 'admin' ? '관리자 모드' : '학생 모드';
  const roleColor = role === 'admin' ? '#FF7A59' : '#2C6DF7';
  const roleIcon = role === 'admin' ? 'shield-checkmark-outline' : 'person-outline';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* 꽉 찬 배경 */}
      <View style={styles.bgFull} />
      <View style={styles.ellipseA} />
      <View style={styles.ellipseB} />
      <Animated.View style={[styles.bubble, styles.b1, float(float1, 14)]} />
      <Animated.View style={[styles.bubble, styles.b2, float(float2, 18)]} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View
          style={{
            opacity: fadeIn,
            transform: [{ translateY: fadeIn.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
          }}
        >
          {/* 인트로 카드 + 역할 칩 */}
          <View style={styles.headGlass}>
            <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.headRow}>
              <View>
                <Text style={styles.appTitle}>DormHub</Text>
                <Text style={styles.appSub}>안전하고 편한 기숙사 생활</Text>
              </View>

              {/* 👉 역할 칩 (학생/관리자) */}
              <View style={styles.roleChipWrap}>
                <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                <Ionicons name={roleIcon as any} size={16} color={roleColor} />
                <Text style={[styles.roleChipText, { color: roleColor }]}>{roleLabel}</Text>
              </View>
            </View>
          </View>

          {/* 입력 카드 */}
          <View style={styles.formGlass}>
            <BlurView intensity={16} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.formBody}>
              <Text style={styles.sectionTitle}>로그인</Text>

              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="이메일"
                  placeholderTextColor="#9AA5BD"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="비밀번호"
                  placeholderTextColor="#9AA5BD"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                  onSubmitEditing={onLogin}
                />
              </View>

              <TouchableOpacity activeOpacity={0.9} onPress={onLogin} disabled={loading} style={styles.ctaWrap}>
                <View style={styles.ctaBtn}>
                  <Animated.View pointerEvents="none" style={[styles.sheen, sheenStyle]} />
                  <Text style={styles.ctaText}>{loading ? '로그인 중…' : '로그인'}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.linkRow}>
                <TouchableOpacity onPress={goSignup}>
                  <Text style={styles.link}>가입하기</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/find-id')}>
                  <Text style={styles.link}>아이디(이메일) 찾기</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/reset-password')}>
                  <Text style={styles.link}>비밀번호 재설정</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* 홈 버튼 */}
      <View style={styles.homeDock}>
        <TouchableOpacity activeOpacity={0.85} onPress={() => router.replace('/')}>
          <Image source={require('../../home_logo.png')} style={{ width: 64, height: 64, resizeMode: 'contain' }} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* =================== 스타일 =================== */
const styles = StyleSheet.create({
  scroll: { paddingTop: 80, paddingHorizontal: 18, paddingBottom: 140 },

  // 배경
  bgFull: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: BASE },
  ellipseA: { position: 'absolute', top: -120, right: -80, width: 260, height: 260, borderRadius: 200, backgroundColor: '#C6D1FF', opacity: 0.35 },
  ellipseB: { position: 'absolute', top: -40, left: -100, width: 220, height: 220, borderRadius: 200, backgroundColor: '#E2E7FF', opacity: 0.45 },
  bubble: { position: 'absolute', width: 18, height: 18, borderRadius: 20, backgroundColor: '#ffffff55' },
  b1: { top: 140, left: 24 }, b2: { top: 90, right: 36 },

  headGlass: {
    borderRadius: 20, overflow: 'hidden',
    backgroundColor: GLASS, borderWidth: 1, borderColor: GLASS_BORDER,
    paddingHorizontal: 18, paddingVertical: 16, marginBottom: 16,
  },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appTitle: { fontSize: 22, fontWeight: '900', color: TEXT_DARK },
  appSub: { marginTop: 4, color: '#4B5674', fontSize: 12 },

  // 역할 칩
  roleChipWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: GLASS_BORDER, backgroundColor: GLASS,
  },
  roleChipText: { fontWeight: '800', fontSize: 13 },

  formGlass: {
    borderRadius: 22, overflow: 'hidden',
    backgroundColor: GLASS, borderWidth: 1, borderColor: GLASS_BORDER,
  },
  formBody: { padding: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: TEXT_DARK, marginBottom: 12 },

  inputWrap: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E3E7F2', marginBottom: 12 },
  input: { paddingHorizontal: 14, height: 54, fontSize: 16, color: TEXT_DARK },

  ctaWrap: { marginTop: 4 },
  ctaBtn: {
    height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: TINT,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, overflow: 'hidden',
  },
  sheen: { position: 'absolute', top: 0, bottom: 0, width: 120, backgroundColor: 'rgba(255,255,255,0.45)' },
  ctaText: { color: '#fff', fontWeight: '900', fontSize: 17, letterSpacing: 0.4 },

  linkRow: { marginTop: 16, gap: 8, alignItems: 'center' },
  link: { color: TINT, fontWeight: '700' },

  homeDock: { position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center' },
});