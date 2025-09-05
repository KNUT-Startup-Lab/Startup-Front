// app/(tabs)/index.tsx
import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
  StyleProp, ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import PastelAuraBackground from '../../src/components/AuraBackground';

/* ================= 디자인 토큰 ================= */
const BASE = '#D6DDFF';                 // 헤더/탭 톤
const BG = '#F6F8FF';                   // 전체 배경
const GLASS = 'rgba(255,255,255,0.65)'; // 글래스 배경
const GLASS_BORDER = 'rgba(255,255,255,0.85)'; // 글래스 테두리
const TINT = '#2C6DF7';
const TINT_GREEN = '#11B38D';
const TITLE = '#0E1420';

/** 헤더 보라색 영역 ‘본문’ 높이(상태바 높이는 자동 더해짐) */
const HEADER_PURPLE_HEIGHT = 44;

/* ================= 유틸 ================= */
/** #RRGGBB → rgba(r,g,b,alpha) : 텍스트/아이콘은 불투명 유지, “배경만” 투명하게 만들 때 사용 */
function withAlpha(hex: string, alpha = 0.78) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ================= 메인 화면 ================= */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [userName, setUserName] = useState<string>('');
  // 필요 시 역할 노출 유지(학생/관리자 표시)
  const [role, setRole] = useState<'student' | 'admin'>('student');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const name = await AsyncStorage.getItem('userName');
        setUserName(name ?? '');
        const savedRole = (await AsyncStorage.getItem('userRole')) ?? (await AsyncStorage.getItem('role')) ?? 'student';
        setRole(savedRole.startsWith('admin') ? 'admin' : 'student');
      })();
    }, [])
  );

  const topBgStyle: StyleProp<ViewStyle> = { height: insets.top + HEADER_PURPLE_HEIGHT };
  const initial = userName?.[0] || '유';
  const roleLabel = role === 'admin' ? '관리자' : '학생';
  const roleTint = role === 'admin' ? '#A65DF5' : '#2C6DF7';

  return (
    <SafeAreaView style={styles.safe}>
      {/* 은은한 파스텔 무빙 배경 */}
      <PastelAuraBackground />

      {/* 상단 보라색 배경(상태바까지) */}
      <View style={[styles.topBg, topBgStyle]} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ========= 헤더(보라영역) ========= */}
        <View style={[styles.topHero, { paddingTop: insets.top + 8 }]}>
          {/* 인사 카드 (보라 배경 안에 동일색 카드) */}
          <View style={styles.greetCardWrap}>
            <View style={styles.greetCardInner}>
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.greetTitle}>안녕하세요, {userName || '사용자'}님!</Text>
                  <View style={styles.rolePill}>
                    <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
                    <View style={[styles.rolePillBorder, { borderColor: roleTint + '88' }]} />
                    <Ionicons
                      name={role === 'admin' ? 'shield-checkmark' : 'school'}
                      size={12}
                      color={roleTint}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.roleText, { color: roleTint }]}>{roleLabel}</Text>
                  </View>
                </View>
                <Text style={styles.greetSub}>오늘 비가와요. 우산을 챙기세요.</Text>
              </View>

              <View style={styles.bellWrap}>
                <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
                <Ionicons name="notifications-outline" size={22} color={TITLE} />
              </View>
            </View>
          </View>

          {/* 상태 칩 3개 (글래스) */}
          <View style={styles.chipsRow}>
            <GlassChip title="나의 호실" value="A-204" accent={TINT} />
            <GlassChip title="상벌점" value="+2" accent={TINT_GREEN} />
            <GlassChip title="공지" value="2 New" accent="#F39C12" />
          </View>
        </View>

        {/* ========= 메인 그리드 ========= */}
        <View style={styles.grid}>
          {/* ✅ 강조 카드 — 배경 네모만 투명, 아이콘/글씨는 불투명 */}
          <ActionCard
            icon={<Ionicons name="bed" size={32} color="#FFFFFF" />} // 아이콘은 완전 불투명
            title={'기숙사\n간편 입주 등록'}
            bg="#35A9F5"  // 배경만 withAlpha로 투명화
            onPress={() => {}}
          />
          <ActionCard
            icon={<MaterialCommunityIcons name="seat" size={32} color="#FFFFFF" />}
            title={'정독실\n예약하기'}
            bg="#10B7A2"
            onPress={() => {}}
          />

          {/* 아웃라인 글래스 카드 2개 */}
          <GlassOutlineCard
            icon={<Ionicons name="restaurant-outline" size={30} color={TINT} />}
            title="이번주 밥 메뉴"
            accent={TINT}
            onPress={() => {}}
          />
          <GlassOutlineCard
            icon={<Ionicons name="chatbubbles-outline" size={30} color={TINT_GREEN} />}
            title="층별 커뮤니티"
            accent={TINT_GREEN}
            onPress={() => {}}
          />
        </View>

        {/* ========= 리스트(나의 최근 예약) ========= */}
        <Text style={styles.sectionTitle}>나의 최근 예약</Text>
        <View style={styles.listGlassWrap}>
          <BlurView intensity={26} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.listItemInner}>
            <View style={styles.emojiBox}>
              <Text style={{ fontSize: 18 }}>📅</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>Study Room Booked</Text>
              <Text style={styles.itemSub}>Room B-301 • Today 2:00 PM</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#687089" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= 소형 컴포넌트 ================= */

function GlassChip({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <View style={styles.chipWrap}>
      <BlurView intensity={26} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.chipInner}>
        <Text style={[styles.chipTitle, { color: accent }]}>{title}</Text>
        <Text style={styles.chipValue}>{value}</Text>
      </View>
    </View>
  );
}

/** 강조 카드: 배경 네모만 투명(아이콘/텍스트는 불투명 유지) */
function ActionCard({
  icon, title, bg, onPress,
}: { icon: React.ReactNode; title: string; bg: string; onPress: () => void }) {
  const displayTitle = title.replace(/\\n/g, '\n');
  const softBg = withAlpha(bg, 0.78); // ← 배경만 투명도 적용

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.actionCard, { backgroundColor: softBg }]}>
      {/* 유리감 경계(불투명) */}
      <View style={styles.actionBorder} />
      {/* 아이콘/텍스트는 불투명 색상 사용 */}
      <View style={styles.actionIconWrap}>{icon}</View>
      <Text style={styles.actionText}>{displayTitle}</Text>
      <Ionicons name="chevron-forward" size={20} color="#FFFFFF" style={{ marginTop: 8 }} />
    </TouchableOpacity>
  );
}

/** 아웃라인(하양) 카드: 글래스화 */
function GlassOutlineCard({
  icon, title, accent, onPress,
}: { icon: React.ReactNode; title: string; accent: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.outlineCard}>
      <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[styles.outlineInner, { borderColor: accent + '55' }]}>
        <View style={[styles.outlineIconCir, { backgroundColor: accent + '14' }]}>{icon}</View>
        <Text style={[styles.outlineText, { color: '#2F3A4F' }]}>{title}</Text>
        <Ionicons name="chevron-forward" size={20} color={accent} style={{ marginTop: 8 }} />
      </View>
    </TouchableOpacity>
  );
}

/* ================= 스타일 ================= */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingBottom: 120 },

  // 상단 보라 배경(상태바까지)
  topBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: BASE,
    zIndex: -1,
  },

  // 헤더 영역
  topHero: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  // 인사 카드
  greetCardWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: BASE,
  },
  greetCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.65)',
    overflow: 'hidden',
  },
  rolePillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
  },
  roleText: { fontSize: 12, fontWeight: '800' },

  avatar: { width: 48, height: 48, borderRadius: 999, backgroundColor: '#E9ECF6' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontWeight: '700', color: TITLE },
  greetTitle: { fontSize: 18, fontWeight: '800', color: TITLE },
  greetSub: { fontSize: 12, color: '#414B68', marginTop: 2 },

  bellWrap: { marginLeft: 8, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: -6, right: -6, backgroundColor: '#FF9A3E', borderRadius: 999,
    paddingHorizontal: 6, paddingVertical: 2, zIndex: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // 칩: 글래스
  chipsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  chipWrap: {
    flex: 1,
    height: 68,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  chipInner: { flex: 1, justifyContent: 'center', paddingHorizontal: 12 },
  chipTitle: { fontSize: 16, fontWeight: '800' },
  chipValue: { fontSize: 13, color: '#6C7893', marginTop: 4 },

  // 그리드
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16, paddingHorizontal: 16 },

  // 강조 카드(배경만 투명)
  actionCard: {
    width: '47%',
    borderRadius: 18,
    padding: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  actionBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  actionIconWrap: {
    width: 54, height: 54, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)', // 아이콘 뒤 원형 하이라이트(불투명 느낌 유지)
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  actionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', lineHeight: 22 },

  // 아웃라인 글래스 카드
  outlineCard: {
    width: '47%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  outlineInner: { padding: 14 },
  outlineIconCir: {
    width: 54, height: 54, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  outlineText: { fontSize: 15, fontWeight: '800', lineHeight: 22, color: '#2F3A4F' },

  // 리스트
  sectionTitle: { marginTop: 18, marginBottom: 10, fontSize: 18, fontWeight: '900', color: TITLE, paddingHorizontal: 16 },

  listGlassWrap: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: GLASS,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  listItemInner: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  itemTitle: { fontWeight: '800', color: '#243048' },
  itemSub: { color: '#6D7898', marginTop: 2, fontSize: 12 },
});