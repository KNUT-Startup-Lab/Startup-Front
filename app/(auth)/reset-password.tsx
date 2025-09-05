// app/(auth)/reset-password.tsx  (임시 비번 발송)
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthAPI } from '../../src/api/auth';
import homeLogo from '../../assets/images/home_logo.png';

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(){
    try{
      if(!email || !phone) return Alert.alert('안내','이메일/전화번호를 입력하세요.');
      setLoading(true);
      const res = await AuthAPI.findPassword({ email, phone });
      Alert.alert('완료', res.message || '임시 비밀번호가 발송되었습니다.', [
        { text:'확인', onPress: ()=> router.replace('/(auth)/login') }
      ]);
    }catch(e:any){ Alert.alert('오류', e.message ?? '요청 실패'); }
    finally{ setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 재설정</Text>
      <TextInput style={styles.input} placeholder="이메일" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholderTextColor="#9AA1AF"/>
      <TextInput style={styles.input} placeholder="전화번호" value={phone} onChangeText={setPhone} placeholderTextColor="#9AA1AF"/>
      <TouchableOpacity style={[styles.primaryBtn, loading && {opacity:0.6}]} disabled={loading} onPress={onSubmit}>
        <Text style={styles.primaryBtnText}>{loading?'처리 중...':'임시 비밀번호 발송'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.homeWrap} onPress={() => router.replace('/(auth)/login')}>
        <Image source={homeLogo} style={styles.homeIcon}/>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{ flex:1, paddingHorizontal:24, paddingTop:12 },
  title:{ fontFamily:'NotoSansKR_700Bold', fontSize:18, color:'#6D86DA', textAlign:'center', marginBottom:12 },
  input:{ height:44, backgroundColor:'#fff', borderRadius:10, paddingHorizontal:12, borderWidth:1, borderColor:'#E2E6EE', marginBottom:12, fontFamily:'NotoSansKR_400Regular' },
  primaryBtn:{ marginTop:4, height:46, borderRadius:12, alignItems:'center', justifyContent:'center', backgroundColor:'#6D86DA' },
  primaryBtnText:{ color:'#fff', fontFamily:'NotoSansKR_700Bold', fontSize:16 },
  homeWrap:{ position:'absolute', bottom:28, alignSelf:'center' },
  homeIcon:{ width:40, height:40, opacity:0.95 },
});