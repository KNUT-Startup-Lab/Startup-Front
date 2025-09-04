// app/auth/find-id.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthAPI } from '../../src/api/auth';
import homeLogo from '../../assets/images/home_logo.png';

export default function FindId() {
  const router = useRouter();
  const [name, setName] = useState(''); const [phone, setPhone] = useState('');

  async function onFind(){
    try{
      if(!name || !phone) return Alert.alert('안내','이름/전화번호를 입력하세요.');
      const res = await AuthAPI.findEmail({ name, phone });
      router.push({ pathname:'/auth/find-id-result', params:{ email: res.email } });
    }catch(e:any){ Alert.alert('오류', e.message ?? '조회 실패'); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>아이디 찾기</Text>
      <TextInput style={styles.input} placeholder="이름" value={name} onChangeText={setName} placeholderTextColor="#9AA1AF"/>
      <TextInput style={styles.input} placeholder="전화번호" value={phone} onChangeText={setPhone} placeholderTextColor="#9AA1AF"/>
      <TouchableOpacity style={styles.primaryBtn} onPress={onFind}><Text style={styles.primaryBtnText}>아이디 찾기</Text></TouchableOpacity>

      <TouchableOpacity style={styles.homeWrap} onPress={() => router.replace('/auth/login')}>
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