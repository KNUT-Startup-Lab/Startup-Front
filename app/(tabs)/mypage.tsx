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
  ActivityIndicator,
  TouchableOpacity,
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

interface QnAItem {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  category: string;
  submittedAt: string;
}

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

  const [recentQnA, setRecentQnA] = useState<QnAItem[]>([]);
  const [qnaLoading, setQnaLoading] = useState(false);

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

  const fetchRecentQnA = useCallback(async () => {
    try {
      setQnaLoading(true);
      // 임시 목업 데이터
      const mockData: QnAItem[] = [
        {
          id: '1',
          title: 'Air conditioner not working in room 204',
          content: 'The AC unit has been making strange noises and not cooling properly.',
          status: 'pending',
          category: '에어컨',
          submittedAt: '2025-01-20T10:00:00Z',
        },
        {
          id: '2',
          title: 'WiFi connection issues',
          content: 'Admin: We\'ve reset the router on your floor.',
          status: 'answered',
          category: 'WiFi',
          submittedAt: '2025-01-19T14:30:00Z',
        },
      ];
      setRecentQnA(mockData);
    } catch (error) {
      console.error('Error fetching recent Q&A:', error);
    } finally {
      setQnaLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      fetchRecentQnA();
    }, [loadProfile, fetchRecentQnA])
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

  const navigateToQnA = () => {
    router.push('/qna');
  };

  const navigateToMyQnA = () => {
    router.push('/my-qna');
  };

  const getStatusColor = (status: string) => {
    return status === 'pending' ? '#FF9500' : '#34C759';
  };

  const getStatusText = (status: string) => {
    return status === 'pending' ? '답변 대기' : '답변 완료';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const headerStyle: StyleProp<ViewStyle> = {
    paddingTop: insets.top + 8,
  };

  const initial = (profile.name || 'U').slice(0, 1);
  const pendingCount = recentQnA.filter(item => item.status === 'pending').length;

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

        {/* Q&A 섹션 */}
        <View style={styles.section}>
          <View style={styles.qnaSectionHeader}>
            <Text style={styles.sectionTitle}>Q&A</Text>
            <TouchableOpacity onPress={navigateToMyQnA}>
              <Text style={styles.seeAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.glassCard}>
            <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.qnaCardInner}>
              {/* Q&A 액션 버튼들 */}
              <View style={styles.qnaActionButtons}>
                <TouchableOpacity 
                  style={[styles.qnaActionButton, styles.primaryQnaButton]}
                  onPress={navigateToQnA}
                >
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>새 질문</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.qnaActionButton, styles.secondaryQnaButton]}
                  onPress={navigateToMyQnA}
                >
                  <Ionicons name="chatbubbles-outline" size={20} color={TINT} />
                  <Text style={styles.secondaryButtonText}>내 질문</Text>
                  {pendingCount > 0 && (
                    <View style={styles.qnaBadge}>
                      <Text style={styles.qnaBadgeText}>{pendingCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* 최근 Q&A 미리보기 */}
              {qnaLoading ? (
                <View style={styles.qnaLoadingContainer}>
                  <ActivityIndicator size="small" color={TINT} />
                  <Text style={styles.qnaLoadingText}>Q&A 불러오는 중...</Text>
                </View>
              ) : (
                <View style={styles.qnaPreviewContainer}>
                  <Text style={styles.qnaPreviewSectionTitle}>최근 질문</Text>
                  {recentQnA.length > 0 ? (
                    recentQnA.slice(0, 2).map((item) => (
                      <QnAPreviewItem 
                        key={item.id} 
                        item={item}
                        getStatusColor={getStatusColor}
                        getStatusText={getStatusText}
                        formatDate={formatDate}
                      />
                    ))
                  ) : (
                    <View style={styles.emptyQnA}>
                      <Ionicons name="chatbubble-outline" size={24} color="#8E98B3" />
                      <Text style={styles.emptyQnAText}>아직 질문이 없습니다</Text>
                      <Text style={styles.emptyQnASubtext}>궁금한 것이 있으면 언제든 질문해보세요!</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

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

function QnAPreviewItem({ item, getStatusColor, getStatusText, formatDate }: { 
  item: QnAItem;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  formatDate: (dateString: string) => string;
}) {
  return (
    <View style={styles.qnaPreviewItem}>
      <View style={styles.qnaPreviewHeader}>
        <Text style={styles.qnaPreviewItemTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.qnaStatusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.qnaStatusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.qnaPreviewContent} numberOfLines={2}>{item.content}</Text>
      <View style={styles.qnaPreviewFooter}>
        <Text style={styles.qnaCategory}>{item.category}</Text>
        <Text style={styles.qnaDate}>{formatDate(item.submittedAt)}</Text>
      </View>
    </View>
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
  
  qnaSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: TINT,
    fontWeight: '600',
  },

  glassCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: GLASS_BORDER,
    backgroundColor: GLASS,
  },

  qnaCardInner: {
    padding: 12,
  },

  qnaActionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  qnaActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    position: 'relative',
  },

  primaryQnaButton: {
    backgroundColor: TINT,
  },

  secondaryQnaButton: {
    backgroundColor: 'rgba(44, 109, 247, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(44, 109, 247, 0.3)',
  },

  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },

  secondaryButtonText: {
    color: TINT,
    fontSize: 14,
    fontWeight: '800',
  },

  qnaBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  qnaBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  qnaLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },

  qnaLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#5E6A86',
  },

  qnaPreviewContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E8ECF5',
    paddingTop: 12,
  },

  qnaPreviewSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: TITLE,
    marginBottom: 10,
  },

  qnaPreviewItem: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },

  qnaPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  qnaPreviewItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: TITLE,
    flex: 1,
    marginRight: 8,
  },

  qnaStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  qnaStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
  },

  qnaPreviewContent: {
    fontSize: 12,
    color: '#5E6A86',
    lineHeight: 16,
    marginBottom: 6,
  },

  qnaPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  qnaCategory: {
    fontSize: 11,
    color: ACCENT,
    fontWeight: '600',
  },

  qnaDate: {
    fontSize: 11,
    color: '#8E98B3',
  },

  emptyQnA: {
    alignItems: 'center',
    paddingVertical: 20,
  },

  emptyQnAText: {
    fontSize: 14,
    color: '#5E6A86',
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
  },

  emptyQnASubtext: {
    fontSize: 12,
    color: '#8E98B3',
    textAlign: 'center',
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