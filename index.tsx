import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView,
  StyleProp, ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';

// (선택) 부드러운 파스텔 배경 컴포넌트가 있을 때만 로드
let PastelAuraBackground: React.ComponentType | null = null;
try {
  // 프로젝트에 없으면 빌드가 깨지지 않도록 try-catch
  // 경로: src/components/AuraBackground.tsx
  // export default function PastelAuraBackground() { ... }
  // 로 만들어둔 경우에만 표시됨
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PastelAuraBackground = require('../../src/components/AuraBackground').default;
} catch { PastelAuraBackground = null; }

/* ===== 디자인 토큰 ===== */
const BASE = '#D6DDFF';                       // 헤더/탭 톤
const BG = '#F6F8FF';                         // 전체 배경
const GLASS = 'rgba(255,255,255,0.65)';       // 칩/리스트 유리 바탕
const GLASS_BORDER = 'rgba(255,255,255,0.85)';// 유리 경계
const TINT = '#2C6DF7';
const TINT_GREEN = '#11B38D';
const TITLE = '#0E1420';

// ✅ 상단 보라색 영역 '본문' 높이 (상태바 높이는 자동합산)
const HEADER_PURPLE_HEIGHT = 44;

// 최근 예약 데이터 타입
interface ReservationItem {
  id: string;
  type: 'study_room' | 'refrigerator';
  title: string;
  subtitle: string;
  icon: string;
  time?: string;
  status?: string;
  onPress: () => void;
}

/** HEX → RGBA 배경색 유틸 (텍스트/아이콘 투명도 영향 없도록!) */
function hexToRgba(hex: string, alpha = 1) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  // ---- 사용자 이름/역할 ----
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'student' | 'admin' | ''>('');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const name = await AsyncStorage.getItem('userName');
        const role = await AsyncStorage.getItem('userRole'); // 'student' | 'admin'
        setUserName(name ?? '');
        setUserRole((role as any) ?? '');
      })();
    }, [])
  );

  // 최근 예약 데이터
  const recentReservations: ReservationItem[] = [
    {
      id: '1',
      type: 'study_room',
      title: 'Study Room Booked',
      subtitle: 'Room B-301',
      icon: '📅',
      time: 'Today 2:00 PM',
      onPress: () => router.push('/(tabs)/reservation'),
    },
    {
      id: '2',
      type: 'refrigerator',
      title: 'Refrigerator Items',
      subtitle: '3 items expiring this week',
      icon: '🧊',
      status: 'Check items below',
      onPress: () => router.push('/refrigerator'),
    },
  ];

  // 상단 보라 배경 높이(상태바 + 헤더 본문)
  const topBgStyle: StyleProp<ViewStyle> = { height: insets.top + HEADER_PURPLE_HEIGHT };
  const initial = userName?.[0] || '유';
  const roleLabel = userRole === 'admin' ? '관리자' : '학생';

  return (
    <SafeAreaView style={styles.safe}>
      {/* 파스텔 노이즈 배경(있으면 사용) */}
      {PastelAuraBackground ? <PastelAuraBackground /> : null}

      {/* 상단 보라 배경 */}
      <View style={[styles.topBg, topBgStyle]} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* ===== 헤더 영역 ===== */}
        <View style={[styles.topHero, { paddingTop: insets.top + 8 }]}>
          {/* 인사 카드 */}
          <View style={styles.greetCardWrap}>
            <View style={styles.greetCardInner}>
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.greetTitle}>
                    안녕하세요, {userName ? userName : '사용자'}님!
                  </Text>
                  <View style={styles.rolePill}>
                    <Text style={styles.rolePillText}>{roleLabel}</Text>
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

          {/* 상태 칩 3개 */}
          <View style={styles.chipsRow}>
            <GlassChip title="나의 호실" value="A-204" accent={TINT} />
            <GlassChip title="상벌점" value="+2" accent={TINT_GREEN} />
            <GlassChip title="공지" value="2 New" accent="#F39C12" />
          </View>
        </View>

        {/* ===== 메인 그리드 ===== */}
        <View style={styles.grid}>
          {/* 배경만 반투명(글씨/아이콘 선명) */}
          <ActionCard
            icon={<Ionicons name="bed" size={32} color="#fff" />}
            title={'기숙사\\n간편 입주 등록'}
            bg={hexToRgba('#35A9F5', 0.9)}
            onPress={() => router.push('/checkin')}
          />
          <ActionCard
            icon={<MaterialCommunityIcons name="seat" size={32} color="#fff" />}
            title={'정독실\\n예약하기'}
            bg={hexToRgba('#10B7A2', 0.9)}
            onPress={() => router.push('/(tabs)/reservation')}
          />

          {/* 글래스 아웃라인 카드 */}
          <GlassOutlineCard
            icon={<Ionicons name="restaurant-outline" size={30} color={TINT} />}
            title="이번주 밥 메뉴"
            accent={TINT}
            onPress={() => router.push('/weekly-menu')}
          />
          <GlassOutlineCard
            icon={<Ionicons name="chatbubbles-outline" size={30} color={TINT_GREEN} />}
            title="층별 커뮤니티"
            accent={TINT_GREEN}
            onPress={() => router.push('/(tabs)/community')}
          />
        </View>

        {/* ===== 리스트 ===== */}
        <Text style={styles.sectionTitle}>나의 최근 예약</Text>
        
        {/* 최근 예약 목록 */}
        {recentReservations.map((item) => (
          <ReservationListItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------------- 소형 컴포넌트 ---------------------- */

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

function GlassOutlineCard({
  icon, title, accent, onPress,
}: { icon: React.ReactNode; title: string; accent: string; onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.outlineCard]}>
      <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[styles.outlineInner, { borderColor: accent + '55' }]}>
        <View style={[styles.outlineIconCir, { backgroundColor: accent + '14' }]}>{icon}</View>
        <Text style={[styles.outlineText, { color: '#2F3A4F' }]}>{title}</Text>
        <Ionicons name="chevron-forward" size={20} color={accent} style={{ marginTop: 8 }} />
      </View>
    </TouchableOpacity>
  );
}

function ReservationListItem({ item }: { item: ReservationItem }) {
  return (
    <TouchableOpacity style={styles.listGlassWrap} onPress={item.onPress}>
      <BlurView intensity={26} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.listItemInner}>
        <View style={styles.emojiBox}>
          <Text style={{ fontSize: 18 }}>{item.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSub}>
            {item.subtitle}
            {item.time && ` • ${item.time}`}
            {item.status && ` • ${item.status}`}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#687089" />
      </View>
    </TouchableOpacity>
  );
}

/* ---------------------- 스타일 ---------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingBottom: 120 },

  // 상단 보라 영역
  topBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: BASE,
    zIndex: -1,
  },

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
  avatar: { width: 48, height: 48, borderRadius: 999, backgroundColor: '#E9ECF6' },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontWeight: '700', color: TITLE },
  greetTitle: { fontSize: 18, fontWeight: '800', color: TITLE },
  greetSub: { fontSize: 12, color: '#414B68', marginTop: 2 },
  rolePill: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3,
  },
  rolePillText: { fontSize: 11, color: '#2E3A58', fontWeight: '800' },

  bellWrap: { marginLeft: 8, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: -6, right: -6, backgroundColor: '#FF9A3E', borderRadius: 999,
    paddingHorizontal: 6, paddingVertical: 2, zIndex: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  // 칩
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

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 16, paddingHorizontal: 16 },

  // 메인 액션 카드(배경만 반투명)
  actionCard: {
    width: '47%',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  actionIconWrap: {
    width: 54, height: 54, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  actionText: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 22 },

  // 글래스 아웃라인 카드
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    marginBottom: 8,
  },
  listItemInner: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emojiBox: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  itemTitle: { fontWeight: '800', color: '#243048' },
  itemSub: { color: '#6D7898', marginTop: 2, fontSize: 12 },
});