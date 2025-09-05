// app/(tabs)/index.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView,
  StyleProp, ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

// ===== 디자인 토큰 =====
const BASE = '#D6DDFF';         // 헤더/탭 톤
const BG = '#F6F8FF';           // 전체 배경
const GLASS = 'rgba(255,255,255,0.55)';
const GLASS_BORDER = 'rgba(255,255,255,0.65)';
const TINT = '#2C6DF7';
const TINT_GREEN = '#11B38D';
const TITLE = '#0E1420';

// ✅ 헤더 보라색 영역(상단 배경)의 ‘본문’ 높이만 조절하면 됨.
//   상태바 높이는 자동으로 더해진다.
const HEADER_PURPLE_HEIGHT = 44; // ← 원하면 숫자만 바꿔서 높이 조절

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  // ---- 사용자 이름 ----
  const [userName, setUserName] = useState<string>('');

  // 화면에 들어올 때마다 최신값 로드
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const name = await AsyncStorage.getItem('userName');
        setUserName(name ?? '');
      })();
    }, [])
  );

  // 상단 보라 배경 높이(상태바 + 헤더 본문)
  const topBgStyle: StyleProp<ViewStyle> = {
    height: insets.top + HEADER_PURPLE_HEIGHT,
  };

  const initial = userName?.[0] || '유';

  return (
    <SafeAreaView style={styles.safe}>
      {/* ✅ 상단 보라색 배경을 상태바까지 절대배치로 깔기 */}
      <View style={[styles.topBg, topBgStyle]} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ===== 헤더 영역 (보라색 영역) — 컨텐츠는 상태바 높이만큼 paddingTop */}
        <View style={[styles.topHero, { paddingTop: insets.top + 8 }]}>
          {/* 인사 카드 (보라 배경 안에 동일색 카드) */}
          <View style={styles.greetCardWrap}>
            <View style={styles.greetCardInner}>
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetTitle}>
                  안녕하세요, {userName ? userName : '사용자'}님!
                </Text>
                <Text style={styles.greetSub}>오늘 비가와요. 우산을 챙기세요.</Text>
              </View>
              <View style={styles.bellWrap}>
                <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
                <Ionicons name="notifications-outline" size={22} color={TITLE} />
              </View>
            </View>
          </View>

          {/* 상태 칩 3개 — BlurView 누수 방지용 래퍼 */}
          <View style={styles.chipsRow}>
            <GlassChip title="나의 호실" value="A-204" accent={TINT} />
            <GlassChip title="상벌점" value="+2" accent={TINT_GREEN} />
            <GlassChip title="공지" value="2 New" accent="#F39C12" />
          </View>
        </View>

        {/* ===== 메인 그리드 ===== */}
        <View style={styles.grid}>
          <ActionCard
            icon={<Ionicons name="bed" size={32} color="#fff" />}
            title={'기숙사\\n간편 입주 등록'}
            bg="#35A9F5"
            onPress={() => {}}
          />
          <ActionCard
            icon={<MaterialCommunityIcons name="seat" size={32} color="#fff" />}
            title={'정독실\\n예약하기'}
            bg="#10B7A2"
            onPress={() => {}}
          />
          <OutlineCard
            icon={<Ionicons name="restaurant-outline" size={30} color={TINT} />}
            title="이번주 밥 메뉴"
            accent={TINT}
            onPress={() => {}}
          />
          <OutlineCard
            icon={<Ionicons name="chatbubbles-outline" size={30} color={TINT_GREEN} />}
            title="층별 커뮤니티"
            accent={TINT_GREEN}
            onPress={() => {}}
          />
        </View>

        {/* ===== 리스트 ===== */}
        <Text style={styles.sectionTitle}>나의 최근 예약</Text>
        <View style={styles.listGlassWrap}>
          <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
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

/* ---------------------- 소형 컴포넌트 ---------------------- */

function GlassChip({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <View style={styles.chipWrap}>
      <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.chipInner}>
        <Text style={[styles.chipTitle, { color: accent }]}>{title}</Text>
        <Text style={styles.chipValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionCard({
  icon, title, bg, onPress,
}: { icon: React.ReactNode; title: string; bg: string; onPress: () => void }) {
  const displayTitle = title.replace(/\\n/g, '\n'); // '\n' 문자열 → 줄바꿈
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.actionCard, { backgroundColor: bg }]}>
      <View style={styles.actionIconWrap}>{icon}</View>
      <Text style={styles.actionText}>{displayTitle}</Text>
      <Ionicons name="chevron-forward" size={20} color="#fff" style={{ marginTop: 8 }} />
    </TouchableOpacity>
  );
}

function OutlineCard({
  icon, title, accent, onPress,
}: { icon: React.ReactNode; title: string; accent: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.outlineCard, { borderColor: accent + '55' }]}>
      <View style={[styles.outlineIconCir, { backgroundColor: accent + '12' }]}>{icon}</View>
      <Text style={[styles.outlineText, { color: '#2F3A4F' }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={accent} style={{ marginTop: 8 }} />
    </TouchableOpacity>
  );
}

/* ---------------------- 스타일 ---------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingBottom: 120 }, // 탭바 띄워놨으니 하단 여유

  // ✅ 상단 보라색 배경(상태바까지)
  topBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: BASE,
    zIndex: 0,
  },

  // 헤더(보라) 본문 — 높이는 topBg에 의해 이미 확보됨
  topHero: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 1,
  },

  // 인사 카드(동일색, 라운드)
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

  // 칩: BlurView 누수 방지용 래퍼
  chipsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  chipWrap: {
    flex: 1,
    height: 68,
    borderRadius: 14,
    overflow: 'hidden',            // ✅ 클리핑
    backgroundColor: GLASS,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  chipInner: { flex: 1, justifyContent: 'center', paddingHorizontal: 12 },
  chipTitle: { fontSize: 16, fontWeight: '800' },
  chipValue: { fontSize: 13, color: '#6C7893', marginTop: 4 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16, paddingHorizontal: 16 },
  actionCard: {
    width: '47%',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  actionIconWrap: {
    width: 54, height: 54, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 22 },

  outlineCard: {
    width: '47%',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  outlineIconCir: {
    width: 54, height: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  outlineText: { fontSize: 15, fontWeight: '800', lineHeight: 22 },

  sectionTitle: { marginTop: 18, marginBottom: 10, fontSize: 18, fontWeight: '900', color: TITLE, paddingHorizontal: 16 },

  listGlassWrap: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: GLASS,
  },
  listItemInner: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center', justifyContent: 'center',
  },
  itemTitle: { fontWeight: '800', color: '#243048' },
  itemSub: { color: '#6D7898', marginTop: 2, fontSize: 12 },
});