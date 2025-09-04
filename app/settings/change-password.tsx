// app/settings/change-password.tsx  (로그인 필요)
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { AuthAPI } from '../../src/api/auth';
import { useAuth } from '../../src/state/AuthContext';

export default function ChangePassword() {
  const { logout } = useAuth();
  const [current_password, setCur] = useState(''); const [new_password, setNew] = useState(''); const [loading, setLoading] = useState(false);

  async function onSave(){
    try{
      if(!current_password || !new_password) return Alert.alert('안내','현재/새 비밀번호를 입력하세요.');
      setLoading(true);
      const res = await AuthAPI.changePassword({ current_password, new_password });
      Alert.alert('완료', res.message || '비밀번호 변경 성공', [{ text:'확인', onPress: ()=> logout() }]);
    }catch(e:any){ Alert.alert('오류', e.message ?? '변경 실패'); }
    finally{ setLoading(false); }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>비밀번호 변경</Text>
      <TextInput style={styles.input} placeholder="현재 비밀번호" secureTextEntry value={current_password} onChangeText={setCur} placeholderTextColor="#9AA1AF"/>
      <TextInput style={styles.input} placeholder="새 비밀번호" secureTextEntry value={new_password} onChangeText={setNew} placeholderTextColor="#9AA1AF"/>
      <TouchableOpacity style={[styles.primaryBtn, loading && {opacity:0.6}]} disabled={loading} onPress={onSave}>
        <Text style={styles.primaryBtnText}>{loading?'처리 중...':'저장'}</Text>
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
});