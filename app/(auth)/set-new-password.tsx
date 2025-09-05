import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import homeLogo from '../../assets/images/home_logo.png';

type Params = { id?: string };

export default function SetNewPassword() {
  const router = useRouter();
  const { id } = useLocalSearchParams<Params>();
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  const onSave = () => {
    if (!pw1 || pw1.length < 6) {
      Alert.alert('안내', '비밀번호는 6자 이상으로 입력하세요.');
      return;
    }
    if (pw1 !== pw2) {
      Alert.alert('안내', '비밀번호가 일치하지 않습니다.');
      return;
    }
    // TODO: 실제 비밀번호 변경 API 호출
    Alert.alert('완료', '비밀번호가 변경되었습니다.', [
      { text: '확인', onPress: () => router.replace('/(auth)/login') },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>

      <TextInput
        style={styles.input}
        placeholder="새 비밀번호"
        secureTextEntry
        value={pw1}
        onChangeText={setPw1}
        placeholderTextColor="#9AA1AF"
      />
      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        secureTextEntry
        value={pw2}
        onChangeText={setPw2}
        placeholderTextColor="#9AA1AF"
      />

      <TouchableOpacity style={styles.primaryBtn} onPress={onSave}>
        <Text style={styles.primaryBtnText}>저장</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeWrap} onPress={() => router.replace('/(auth)/login')}>
        <Image source={homeLogo} style={styles.homeIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  title: { fontFamily: 'NotoSansKR_700Bold', fontSize: 18, color: '#6D86DA', textAlign: 'center', marginBottom: 12 },
  input: {
    height: 44, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#E2E6EE', marginBottom: 12, fontFamily: 'NotoSansKR_400Regular',
  },
  primaryBtn: { marginTop: 4, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6D86DA' },
  primaryBtnText: { color: '#fff', fontFamily: 'NotoSansKR_700Bold', fontSize: 16 },
  homeWrap: { position: 'absolute', bottom: 28, alignSelf: 'center' },
  homeIcon: { width: 40, height: 40, opacity: 0.95 },
});