// app/(tabs)/mypage.tsx
import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Design tokens (앱 공통 톤과 매칭)
const BG = '#F6F8FF';
const BASE = '#D6DDFF';
const TITLE = '#0E1420';
const TINT = '#2C6DF7';
const ACCENT = '#13B38D';
const GLASS = 'rgba(255,255,255,0.70)';
const GLASS_BORDER = 'rgba(255,255,255,0.88)';

type Profile = {
  name: string;
  email: string;
  student_num?: string;
  college?: string;
  major?: string;
  role?: 'student' | 'admin';
};

export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    name: '',
    email: '',
    student_num: '',
    college: '',
    major: '',
    role: 'student',
  });

  // 로컬(AsyncStorage)에서 불러오기 — 나중에 API 변경시 여기만 교체
  const loadProfile = useCallback(async () => {
    const [
      name,
      email,
      student_num,
      college,
      major,
      role,
    ] = await Promise.all([
      AsyncStorage.getItem('userName'),
      AsyncStorage.getItem('email'),
      AsyncStorage.getItem('student_num'),
      AsyncStorage.getItem('college'),
      AsyncStorage.getItem('major'),
      AsyncStorage.getItem('role'),
    ]);

    setProfile({
      name: name ?? '사용자',
      email: email ?? 'unknown@example.com',
      student_num: student_num ?? '',
      college: college ?? '',
      major: major ?? '',
      role: (role as Profile['role']) ?? 'student',
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const onLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          // 토큰 및 사용자 캐시 제거
          await AsyncStorage.multiRemove([
            'accessToken',
            'refreshToken',
            'userName',
            'email',
            'student_num',
            'college',
            'major',
            'role',
          ]);
          router.replace('/(auth)/login'); // 로그인 화면으로
        },
      },
    ]);
  };

  const headerStyle: StyleProp<ViewStyle> = {
    paddingTop: insets.top + 8,
  };

  const initial = (profile.name || 'U').slice(0, 1);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, headerStyle]}>
        <Text style={styles.headerTitle}>내 정보</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <BlurView intensity={26} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.profileInner}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{profile.name || '사용자'}</Text>
                <RoleBadge role={profile.role} />
              </View>
              <View style={styles.row}>
                <Ionicons name="mail-outline" size={16} color="#5E6A86" />
                <Text style={styles.rowText}>{profile.email}</Text>
              </View>
              {profile.student_num ? (
                <View style={styles.row}>
                  <Ionicons name="id-card-outline" size={16} color="#5E6A86" />
                  <Text style={styles.rowText}>학번 {profile.student_num}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* 학적/전공 카드 */}
        <GlassSection title="학적 정보">
          <InfoItem icon="business-outline" label="단과대" value={profile.college || '-'} />
          <InfoItem icon="book-outline" label="전공" value={profile.major || '-'} />
        </GlassSection>

        {/* 계정 설정 */}
        <GlassSection title="계정">
          <MenuItem
            icon="key-outline"
            label="비밀번호 변경"
            onPress={() => Alert.alert('준비중', '비밀번호 변경 화면은 추후 제공됩니다.')}
          />
          <MenuItem
            icon="person-circle-outline"
            label="프로필 이미지 변경"
            onPress={() => Alert.alert('준비중', '프로필 이미지 변경은 추후 제공됩니다.')}
          />
        </GlassSection>

        {/* 로그아웃 */}
        <Pressable style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>

        <Text style={styles.buildInfo}>DormHub · v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Sub Components ---------- */

function RoleBadge({ role }: { role?: 'student' | 'admin' }) {
  const isAdmin = role === 'admin';
  return (
    <View style={[styles.badge, { backgroundColor: isAdmin ? '#FFE9EC' : '#EAF8F3', borderColor: isAdmin ? '#FFD0D6' : '#CDEFE4' }]}>
      <Ionicons
        name={isAdmin ? 'shield-checkmark-outline' : 'school-outline'}
        size={12}
        color={isAdmin ? '#E2556A' : '#11A77F'}
        style={{ marginRight: 4 }}
      />
      <Text style={[styles.badgeText, { color: isAdmin ? '#E2556A' : '#11A77F' }]}>
        {isAdmin ? '관리자' : '학생'}
      </Text>
    </View>
  );
}

function GlassSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.glassCard}>
        <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
        <View style={{ padding: 12 }}>{children}</View>
      </View>
    </View>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={16} color="#5E6A86" />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuL}>
        <Ionicons name={icon} size={18} color={TINT} />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#8E98B3" />
    </Pressable>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingBottom: 48 },

  header: {
    backgroundColor: BASE,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: TITLE },

  profileCard: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: GLASS,
  },
  profileInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: '#E9ECF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F5F7FF',
  },
  avatarInitial: { fontSize: 20, fontWeight: '900', color: TITLE },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 18, fontWeight: '900', color: TITLE },

  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  rowText: { color: '#47516B' },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '800' },

  section: { marginTop: 16, marginHorizontal: 16 },
  sectionTitle: { fontWeight: '900', color: TITLE, marginBottom: 8 },
  glassCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: GLASS,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF5',
  },
  infoLabel: { marginLeft: 8, color: '#5E6A86', width: 70 },
  infoValue: { flex: 1, fontWeight: '800', color: TITLE },

  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECF5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuL: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuLabel: { fontWeight: '800', color: TITLE },

  logoutBtn: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: TINT,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  logoutText: { color: '#fff', fontWeight: '900' },

  buildInfo: {
    textAlign: 'center',
    color: '#8C97B0',
    fontSize: 12,
    marginTop: 10,
  },
});