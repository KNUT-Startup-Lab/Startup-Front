// app/(auth)/find-id-result.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import homeLogo from '../../assets/images/home_logo.png';

type P = { email?: string };

export default function FindIdResult() {
  const { email } = useLocalSearchParams<P>();
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>아이디 찾기</Text>
      <View style={styles.box}>
        <Text style={styles.txt}>사용자님의 아이디는</Text>
        <Text style={[styles.txt, styles.bold]}>{email ?? '-'}</Text>
        <Text style={styles.txt}>입니다.</Text>
      </View>
      <TouchableOpacity style={styles.homeWrap} onPress={() => router.replace('/(auth)/login')}>
        <Image source={homeLogo} style={styles.homeIcon}/>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{ flex:1, paddingHorizontal:24, paddingTop:12, alignItems:'center' },
  title:{ fontFamily:'NotoSansKR_700Bold', fontSize:18, color:'#6D86DA', marginBottom:20 },
  box:{ width:'100%', backgroundColor:'#fff', borderRadius:12, borderWidth:1, borderColor:'#E2E6EE', paddingVertical:24, alignItems:'center' },
  txt:{ fontFamily:'NotoSansKR_400Regular', fontSize:16, color:'#222' },
  bold:{ fontFamily:'NotoSansKR_700Bold', marginVertical:6 },
  homeWrap:{ position:'absolute', bottom:28, alignSelf:'center' },
  homeIcon:{ width:40, height:40, opacity:0.95 },
});