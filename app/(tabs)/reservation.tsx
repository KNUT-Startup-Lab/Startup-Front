// app/(tabs)/reservation.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

// ---- Design tokens
const BASE = '#D6DDFF';
const BG = '#F6F8FF';
const TITLE = '#0E1420';
const TINT = '#2C6DF7';
const GREEN = '#13B38D';

type Seat = {
  id: string;          // '1' ~ '30'
  label: string;       // 표시용 라벨
  status: 'available' | 'occupied';
};

// 유틸: 시간 포맷, 더하기
const pad = (n: number) => String(n).padStart(2, '0');
const addTime = (sh: number, sm: number, dh: number, dm: number) => {
  let totalMin = sh * 60 + sm + dh * 60 + dm;
  if (totalMin < 0) totalMin = 0;
  const endH = Math.floor((totalMin / 60) % 24);
  const endM = totalMin % 60;
  return { endH, endM };
};

export default function StudyReservationScreen() {
  const router = useRouter();

  // --- 좌석 1~30, 일부는 사용중 처리
  const seats: Seat[] = useMemo(() => {
    const data: Seat[] = [];
    for (let i = 1; i <= 30; i++) {
      data.push({
        id: String(i),
        label: String(i),
        status: (i % 5 === 0 || i === 2 || i === 7 || i === 18) ? 'occupied' : 'available',
      });
    }
    return data;
  }, []);

  const [selected, setSelected] = useState<Seat | null>(null);

  // 시작 시간(사용자 설정)
  const [startHour, setStartHour] = useState<number>(14);
  const [startMin, setStartMin] = useState<0 | 30>(0);

  // 이용 시간(사용자 설정)
  const [durHours, setDurHours] = useState<number>(2);     // 1~6
  const [durMins, setDurMins] = useState<0 | 30>(0);       // 0/30

  const { endH, endM } = addTime(startHour, startMin, durHours, durMins);
  const availableCount = seats.filter(s => s.status === 'available').length;

  const onSeatPress = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    setSelected(seat);
  };

  const reserveNow = () => {
    if (!selected) {
      Alert.alert('좌석 선택', '예약할 좌석을 먼저 선택해주세요.');
      return;
    }
    const timeRange = `${pad(startHour)}:${pad(startMin)} ~ ${pad(endH)}:${pad(endM)}`;
    const durStr = `${durHours}시간${durMins ? ` ${durMins}분` : ''}`;
    Alert.alert(
      '예약 완료',
      `${selected.label}번 좌석을 ${timeRange} (${durStr})로 예약했습니다.`,
      [{ text: '확인', onPress: () => router.back() }]
    );
  };

  // 스테퍼 핸들러
  const step = (v: number, delta: 1 | -1, min: number, max: number) =>
    Math.min(max, Math.max(min, v + delta));

  const toggleHalf = <T extends 0 | 30>(v: T) => (v === 0 ? 30 : 0) as T;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* ---- 헤더 ---- */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={TITLE} />
          </Pressable>
          <Text style={styles.headerTitle}>정독실 예약</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* ---- 현재 배치도 카드 ---- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>현재 배치도</Text>
            <View style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: GREEN }]} />
              <Text style={styles.legendText}>예약가능</Text>
              <View style={{ width: 12 }} />
              <View style={[styles.dot, { backgroundColor: '#C8CFDA' }]} />
              <Text style={styles.legendText}>사용중</Text>
            </View>
          </View>

          {/* 좌석 그리드 */}
          <View style={styles.grid}>
            {seats.map((seat) => {
              const isSel = selected?.id === seat.id;
              const isOcc = seat.status === 'occupied';
              const base = isOcc ? '#C8CFDA' : GREEN;
              const bg = isSel ? TINT : base;

              return (
                <Pressable
                  key={seat.id}
                  style={[styles.seat, { backgroundColor: bg, opacity: isOcc ? 0.55 : 1 }]}
                  onPress={() => onSeatPress(seat)}
                  disabled={isOcc}
                >
                  <Text style={styles.seatLabel}>{seat.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.availText}>
            <Text style={{ fontWeight: '900', color: TITLE }}>{availableCount}</Text>
            <Text style={{ color: '#606B85' }}> / 30 seats available</Text>
          </Text>
        </View>

        {/* ---- 예약하기 패널 (글래스) ---- */}
        <View style={styles.panelWrap}>
          <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.panelInner}>
            <Text style={styles.panelTitle}>예약하기</Text>

            {/* 좌석 선택 박스 */}
            <View style={styles.selectRow}>
              <View style={styles.seatBadge}>
                <Ionicons name="bookmark-outline" size={18} color={TINT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectLabel}>좌석선택</Text>
                <Text style={styles.selectValue}>
                  {selected ? `Seat ${selected.label}` : '좌석을 선택해주세요'}
                </Text>
              </View>
              <Text style={styles.link}>변경</Text>
            </View>

            {/* 시작 시간 선택 */}
            <Text style={[styles.blockTitle]}>시작 시간</Text>
            <View style={styles.durationWrap}>
              <View style={styles.stepBlock}>
                <Text style={styles.stepLabel}>시</Text>
                <View style={styles.stepRow}>
                  <Pressable
                    style={styles.stepBtn}
                    onPress={() => setStartHour(h => step(h, -1, 0, 23))}
                  >
                    <Ionicons name="remove" size={18} color={TITLE} />
                  </Pressable>
                  <Text style={styles.stepValue}>{pad(startHour)}</Text>
                  <Pressable
                    style={styles.stepBtn}
                    onPress={() => setStartHour(h => step(h, 1, 0, 23))}
                  >
                    <Ionicons name="add" size={18} color={TITLE} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.stepBlock}>
                <Text style={styles.stepLabel}>분</Text>
                <View style={styles.stepRow}>
                  <Pressable style={styles.stepBtn} onPress={() => setStartMin(m => toggleHalf(m))}>
                    <Ionicons name="swap-vertical" size={18} color={TITLE} />
                  </Pressable>
                  <Text style={styles.stepValue}>{pad(startMin)}</Text>
                  <Pressable style={[styles.stepBtn, { opacity: 0 }]} disabled>
                    <Ionicons name="add" size={18} color={TITLE} />
                  </Pressable>
                </View>
                <Text style={styles.stepHint}>0 ↔ 30 토글</Text>
              </View>
            </View>

            {/* 이용 시간 선택 */}
            <Text style={[styles.blockTitle]}>이용 시간</Text>
            <View style={styles.durationWrap}>
              <View style={styles.stepBlock}>
                <Text style={styles.stepLabel}>시간</Text>
                <View style={styles.stepRow}>
                  <Pressable
                    style={styles.stepBtn}
                    onPress={() => setDurHours(h => step(h, -1, 1, 6))}
                  >
                    <Ionicons name="remove" size={18} color={TITLE} />
                  </Pressable>
                  <Text style={styles.stepValue}>{durHours}</Text>
                  <Pressable
                    style={styles.stepBtn}
                    onPress={() => setDurHours(h => step(h, 1, 1, 6))}
                  >
                    <Ionicons name="add" size={18} color={TITLE} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.stepBlock}>
                <Text style={styles.stepLabel}>분</Text>
                <View style={styles.stepRow}>
                  <Pressable style={styles.stepBtn} onPress={() => setDurMins(m => toggleHalf(m))}>
                    <Ionicons name="swap-vertical" size={18} color={TITLE} />
                  </Pressable>
                  <Text style={styles.stepValue}>{durMins}</Text>
                  <Pressable style={[styles.stepBtn, { opacity: 0 }]} disabled>
                    <Ionicons name="add" size={18} color={TITLE} />
                  </Pressable>
                </View>
                <Text style={styles.stepHint}>0 ↔ 30 토글</Text>
              </View>
            </View>

            {/* 요약 */}
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                이용시간: {pad(startHour)}:{pad(startMin)} ~ {pad(endH)}:{pad(endM)} · 총 {durHours}시간{durMins ? ` ${durMins}분` : ''}
              </Text>
            </View>

            {/* 안내 문구 */}
            <Text style={styles.notice}>
              ※ 장시간 미사용 시 좌석은 자동으로 배석 해제될 수 있습니다.
            </Text>

            {/* 예약 버튼 */}
            <Pressable style={styles.cta} onPress={reserveNow}>
              <Text style={styles.ctaText}>예약하기</Text>
            </Pressable>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingBottom: 24 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BASE,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 12,
  },
  backBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: TITLE },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: '#EEF1F7',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontWeight: '900', color: TITLE },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 12, color: '#5F6A86' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  seat: {
    width: 34, height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  seatLabel: { color: '#fff', fontWeight: '800', fontSize: 13 },
  availText: { marginTop: 12, textAlign: 'right' },

  // Panel (glass)
  panelWrap: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFFB0',
  },
  panelInner: { padding: 14 },
  panelTitle: { fontWeight: '900', color: TITLE, marginBottom: 8 },

  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFDA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8ECF5',
  },
  seatBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#E9F0FF',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  selectLabel: { fontSize: 12, color: '#6B7895' },
  selectValue: { fontSize: 15, fontWeight: '800', color: TITLE },
  link: { color: TINT, fontWeight: '800' },

  blockTitle: { marginTop: 14, marginBottom: 6, fontWeight: '900', color: TITLE },

  // Duration/Time stepper
  durationWrap: {
    flexDirection: 'row',
    gap: 12,
  },
  stepBlock: {
    flex: 1,
    backgroundColor: '#FFFFFFF0',
    borderWidth: 2,
    borderColor: '#E7ECF7',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  stepLabel: { fontSize: 12, color: '#6B7895', marginBottom: 6 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: '#EEF3FF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#DDE6FF',
  },
  stepValue: { width: 40, textAlign: 'center', fontSize: 16, fontWeight: '900', color: TITLE },
  stepHint: { marginTop: 6, fontSize: 10, color: '#94A0B8' },

  summary: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FFFFFFE6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECF5',
  },
  summaryText: { fontWeight: '800', color: '#2E374E' },

  notice: {
    marginTop: 8,
    fontSize: 12,
    color: '#6D7898',
  },

  // CTA
  cta: {
    marginTop: 14,
    backgroundColor: TINT,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaText: { color: '#fff', fontWeight: '900' },
});