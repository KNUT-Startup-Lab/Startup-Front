import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/state/AuthContext';

type Role = 'student' | 'admin';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role: Role = roleParam === 'admin' ? 'admin' : 'student';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    try {
      if (!email || !password) {
        return Alert.alert('안내', '이메일과 비밀번호를 입력하세요.');
      }
      setLoading(true);
      await login({ email, password });

      // ✅ 로그인 성공 → 홈(index.tsx)으로 이동
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '로그인 실패');
    } finally {
      setLoading(false);
    }
  }

  const signupHref =
    role === 'admin' ? '/(auth)/signup-admin' : '/(auth)/signup-student';

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
        <Text style={styles.primaryBtnText}>
          {loading ? '처리 중...' : '로그인'}
        </Text>
      </TouchableOpacity>

      <View style={styles.links}>
        <Link href={signupHref} style={styles.linkText}>
          가입하기
        </Link>
        <Link href="/(auth)/find-id" style={styles.linkText}>
          아이디(이메일) 찾기
        </Link>
        <Link href="/(auth)/reset-password" style={styles.linkText}>
          비밀번호 재설정
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6D86DA',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E6EE',
    marginBottom: 12,
  },
  primaryBtn: {
    marginTop: 6,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6D86DA',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  links: { marginTop: 18, gap: 8, alignItems: 'center' },
  linkText: { color: '#6D86DA', fontWeight: '400' },
});