// app/(tabs)/admin.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const TINT = '#2C6DF7';
const TEXT_DARK = '#20263A';
const GLASS_BG = 'rgba(255,255,255,0.55)';
const GLASS_BORDER = 'rgba(255,255,255,0.65)';

export default function AdminScreen() {
  const menuItems = [
    { icon: 'calendar-outline', title: '예약 관리', desc: '학생 예약 현황 및 승인' },
    { icon: 'people-outline', title: '회원 관리', desc: '학생/관리자 계정 관리' },
    { icon: 'home-outline', title: '시설 관리', desc: '기숙사 시설 정보 관리' },
    { icon: 'notifications-outline', title: '공지 관리', desc: '공지사항 작성 및 관리' },
    { icon: 'chatbubbles-outline', title: '게시글 관리', desc: '커뮤니티 게시글 모니터링' },
    { icon: 'stats-chart-outline', title: '통계', desc: '이용 현황 및 통계 분석' },
  ];

  return (
    <View style={styles.container}>
      {/* 배경 */}
      <View style={styles.bgFull} />
      <View style={styles.ellipseA} />
      <View style={styles.ellipseB} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={32} color={TINT} />
          <Text style={styles.headerTitle}>관리자 대시보드</Text>
          <Text style={styles.headerSub}>시스템 관리 및 모니터링</Text>
        </View>

        {/* 메뉴 카드들 */}
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.cardWrap}
            activeOpacity={0.8}
            onPress={() => {
              // TODO: 각 메뉴별 화면으로 이동
            }}
          >
            <View style={styles.card}>
              <BlurView intensity={16} tint="light" style={StyleSheet.absoluteFill} />
              <View style={styles.cardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon as any} size={28} color={TINT} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9AA5BD" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#D6DDFF',
  },
  ellipseA: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: '#C6D1FF',
    opacity: 0.35,
  },
  ellipseB: {
    position: 'absolute',
    top: -40,
    left: -100,
    width: 220,
    height: 220,
    borderRadius: 200,
    backgroundColor: '#E2E7FF',
    opacity: 0.45,
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 18,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: TEXT_DARK,
    marginTop: 8,
  },
  headerSub: {
    fontSize: 14,
    color: '#4B5674',
    marginTop: 4,
  },
  cardWrap: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: GLASS_BG,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(44, 109, 247, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#4B5674',
  },
});
