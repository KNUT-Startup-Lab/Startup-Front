import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/state/AuthContext';
import homeLogo from '../../assets/images/home_logo.png';

type Role = 'student' | 'admin';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role: Role = roleParam === 'admin' ? 'admin' : 'student'; // 기본값: student

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    try {
      if (!email || !password) return Alert.alert('안내', '이메일/비밀번호를 입력하세요.');
      setLoading(true);
      await login({ email, password });
      Alert.alert('로그인', '로그인 성공', [
        { text: '확인', onPress: () => router.replace('/settings/change-password') },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '로그인 실패');
    } finally {
      setLoading(false);
    }
  }

  // 가입하기 목적지(학생/관리자) 분기
  const signupHref = role === 'admin' ? '/auth/signup-admin' : '/auth/signup-student';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#9AA1AF"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#9AA1AF"
      />

      <TouchableOpacity
        style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={onSubmit}
      >
        <Text style={styles.primaryBtnText}>{loading ? '처리 중...' : '로그인'}</Text>
      </TouchableOpacity>

      <View style={styles.links}>
        {/* ⬇ role에 따라 자동으로 학생/관리자 가입 화면으로 이동 */}
        <Link href={signupHref} style={styles.linkText}>가입하기</Link>
        <Link href="/auth/find-id" style={styles.linkText}>아이디(이메일) 찾기</Link>
        <Link href="/auth/reset-password" style={styles.linkText}>비밀번호 재설정</Link>
      </View>

      <TouchableOpacity style={styles.homeWrap} onPress={() => router.replace('/')}>
        <Image source={homeLogo} style={styles.homeIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: { fontFamily: 'NotoSansKR_700Bold', fontSize: 20, color: '#6D86DA', textAlign: 'center', marginBottom: 24 },
  input: {
    height: 44, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#E2E6EE', marginBottom: 12, fontFamily: 'NotoSansKR_400Regular',
  },
  primaryBtn: {
    marginTop: 6, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#6D86DA',
  },
  primaryBtnText: { color: '#fff', fontFamily: 'NotoSansKR_700Bold', fontSize: 16 },
  links: { marginTop: 18, gap: 8, alignItems: 'center' },
  linkText: { color: '#6D86DA', fontFamily: 'NotoSansKR_400Regular' },
  homeWrap: { position: 'absolute', bottom: 28, alignSelf: 'center' },
  homeIcon: { width: 40, height: 40, opacity: 0.95 },
});