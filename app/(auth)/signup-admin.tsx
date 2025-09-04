// app/auth/signup-admin.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthAPI, SignupReq } from '../../src/api/auth';
import homeLogo from '../../assets/images/home_logo.png';

export default function SignupAdmin() {
  const router = useRouter();

  // 단과대/전공 제거: 이름, 사번/학번(student_num), 이메일, 비번, 전화번호만 사용
  const [form, setForm] = useState<SignupReq>({
    name: '',
    student_num: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof SignupReq>(k: K, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function onSubmit() {
    try {
      if (!form.name || !form.student_num || !form.email || !form.password) {
        return Alert.alert('안내', '이름/사번(학번)/이메일/비밀번호를 입력하세요.');
      }
      const chk = await AuthAPI.checkEmail(form.email);
      if (!chk.available) return Alert.alert('안내', chk.message || '이미 사용 중인 이메일입니다.');

      setLoading(true);
      const res = await AuthAPI.signup(form);
      Alert.alert('완료', res.message || '회원가입 성공', [
        { text: '확인', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '회원가입 실패');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>관리자 회원 가입</Text>

      <TextInput
        style={styles.input}
        placeholder="이름"
        value={form.name}
        onChangeText={t => set('name', t)}
        placeholderTextColor="#9AA1AF"
      />

      <TextInput
        style={styles.input}
        placeholder="사번/학번"
        value={form.student_num}
        onChangeText={t => set('student_num', t)}
        placeholderTextColor="#9AA1AF"
      />

      <TextInput
        style={styles.input}
        placeholder="이메일"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={t => set('email', t)}
        placeholderTextColor="#9AA1AF"
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        secureTextEntry
        value={form.password}
        onChangeText={t => set('password', t)}
        placeholderTextColor="#9AA1AF"
      />

      <TextInput
        style={styles.input}
        placeholder="전화번호"
        value={form.phone}
        onChangeText={t => set('phone', t)}
        placeholderTextColor="#9AA1AF"
      />

      <TouchableOpacity
        style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={onSubmit}
      >
        <Text style={styles.primaryBtnText}>{loading ? '처리 중...' : '가입하기'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeWrap} onPress={() => router.replace('/auth/login')}>
        <Image source={homeLogo} style={styles.homeIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  title: { fontFamily: 'NotoSansKR_700Bold', fontSize: 18, color: '#6D86DA', textAlign: 'center', marginBottom: 12 },
  input: {
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E6EE',
    marginBottom: 12,
    fontFamily: 'NotoSansKR_400Regular',
  },
  primaryBtn: {
    marginTop: 4,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6D86DA',
  },
  primaryBtnText: { color: '#fff', fontFamily: 'NotoSansKR_700Bold', fontSize: 16 },
  homeWrap: { position: 'absolute', bottom: 28, alignSelf: 'center' },
  homeIcon: { width: 40, height: 40, opacity: 0.95 },
});