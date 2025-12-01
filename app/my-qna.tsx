import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';


const BG = '#F6F8FF';
const BASE = '#D6DDFF';
const TITLE = '#0E1420';
const TINT = '#2C6DF7';
const ACCENT = '#13B38D';

type MyQnAItem = {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  category: string;
  submittedAt: number;
  updatedAt?: number;
  answer?: string;
  adminName?: string;
};

export default function MyQnAScreen() {
  const router = useRouter();
  const [myQnaList, setMyQnaList] = useState<MyQnAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');

  // 상세 모달
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MyQnAItem | null>(null);

  useEffect(() => {
    fetchMyQnAList();
  }, []);

  const fetchMyQnAList = async () => {
    try {
      setLoading(true);
      // 임시 목업 데이터
      const mockData: MyQnAItem[] = [
        {
          id: '1',
          title: '204호 에어컨 고장',
          content: '에어컨에서 이상한 소리가 나고 냉방이 안 됩니다. 2일째 계속 그래요.',
          status: 'pending',
          category: '에어컨',
          submittedAt: Date.now() - 1000 * 60 * 60 * 2,
        },
        {
          id: '2',
          title: 'WiFi 연결 문제',
          content: '2층에서 WiFi 연결이 자주 끊깁니다.',
          status: 'answered',
          category: 'WiFi',
          submittedAt: Date.now() - 1000 * 60 * 60 * 24,
          updatedAt: Date.now() - 1000 * 60 * 60 * 12,
          answer: '라우터를 재설정했습니다. 다시 연결해보시고 문제가 지속되면 알려주세요.',
          adminName: '관리자',
        },
        {
          id: '3',
          title: '세탁기 3번 오류',
          content: '2층 세탁기 3번에서 E3 오류가 뜹니다.',
          status: 'pending',
          category: '세탁기',
          submittedAt: Date.now() - 1000 * 60 * 60 * 48,
        },
      ];
      setMyQnaList(mockData);
    } catch (error) {
      Alert.alert('오류', '내 Q&A를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyQnAList();
  };

  const deleteQuestion = (id: string) => {
    Alert.alert('삭제', '이 질문을 삭제할까요?', [
      { text: '취소' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setMyQnaList(prev => prev.filter(item => item.id !== id));
          setDetailVisible(false);
          Alert.alert('완료', 'Q&A가 삭제되었습니다.');
        },
      },
    ]);
  };

  const openDetail = (item: MyQnAItem) => {
    setSelectedItem(item);
    setDetailVisible(true);
  };

  const timeAgo = (t: number) => {
    const diff = Date.now() - t;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${Math.max(1, minutes)}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const getStatusColor = (status: string) => {
    return status === 'answered' ? ACCENT : '#FF9500';
  };

  const getStatusText = (status: string) => {
    return status === 'answered' ? '답변 완료' : '답변 대기';
  };

  const filteredList = filter === 'all'
    ? myQnaList
    : myQnaList.filter(item => item.status === filter);

  const stats = {
    total: myQnaList.length,
    pending: myQnaList.filter(i => i.status === 'pending').length,
    answered: myQnaList.filter(i => i.status === 'answered').length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={TINT} />
          <Text style={styles.loadingText}>내 Q&A를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={TITLE} />
          </Pressable>
          <Text style={styles.headerTitle}>내 Q&A</Text>
          <Pressable style={styles.newBtn} onPress={() => router.push('/qna')}>
            <Text style={styles.newBtnText}>+ 새 질문</Text>
          </Pressable>
        </View>

        {/* 통계 카드 (글래스) */}
        <View style={styles.statsWrap}>
          <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.statsInner}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>총 질문</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF9500' }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>답변 대기</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: ACCENT }]}>{stats.answered}</Text>
              <Text style={styles.statLabel}>답변 완료</Text>
            </View>
          </View>
        </View>

        {/* 필터 버튼 */}
        <View style={styles.filterWrap}>
          {(['all', 'pending', 'answered'] as const).map(f => (
            <Pressable
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? '전체' : f === 'pending' ? '답변 대기' : '답변 완료'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 힌트 */}
        <Text style={styles.sectionHint}>내가 작성한 질문 목록입니다</Text>

        {/* Q&A 목록 */}
        {filteredList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={48} color="#9AA5BD" />
            <Text style={styles.emptyText}>
              {filter === 'all' ? '작성한 질문이 없습니다' : `${getStatusText(filter)} 상태의 질문이 없습니다`}
            </Text>
            {filter === 'all' && (
              <Pressable style={styles.emptyBtn} onPress={() => router.push('/qna')}>
                <Text style={styles.emptyBtnText}>첫 질문 작성하기</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filteredList.map(item => (
            <Pressable key={item.id} style={styles.qnaCard} onPress={() => openDetail(item)}>
              <View style={styles.qnaHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                </View>
              </View>

              <Text style={styles.qnaTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.qnaContent} numberOfLines={2}>{item.content}</Text>

              <View style={styles.qnaFooter}>
                <Text style={styles.qnaTime}>{timeAgo(item.submittedAt)}</Text>
                {item.status === 'answered' && (
                  <View style={styles.answeredHint}>
                    <Ionicons name="checkmark-circle" size={14} color={ACCENT} />
                    <Text style={styles.answeredText}>답변 있음</Text>
                  </View>
                )}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* 질문 상세 모달 */}
      <Modal transparent visible={detailVisible} animationType="slide" onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.modalWrap}>
          <Pressable style={styles.modalBackdrop} onPress={() => setDetailVisible(false)} />
          <View style={[styles.modalSheet, { maxHeight: '80%' }]}>
            {selectedItem && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailHeader}>
                  <Text style={styles.modalTitle}>질문 상세</Text>
                  {selectedItem.status === 'pending' && (
                    <Pressable onPress={() => deleteQuestion(selectedItem.id)}>
                      <Ionicons name="trash-outline" size={20} color="#E25C5C" />
                    </Pressable>
                  )}
                </View>

                <View style={styles.detailBadges}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{selectedItem.category}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedItem.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(selectedItem.status)}</Text>
                  </View>
                </View>

                <Text style={styles.detailTitle}>{selectedItem.title}</Text>
                <Text style={styles.detailTime}>{timeAgo(selectedItem.submittedAt)}</Text>
                <Text style={styles.detailContent}>{selectedItem.content}</Text>

                {selectedItem.answer && (
                  <View style={styles.answerBox}>
                    <View style={styles.answerHeader}>
                      <Ionicons name="chatbubble-ellipses" size={18} color={TINT} />
                      <Text style={styles.answerLabel}>관리자 답변</Text>
                    </View>
                    {selectedItem.adminName && (
                      <Text style={styles.adminName}>{selectedItem.adminName}</Text>
                    )}
                    <Text style={styles.answerContent}>{selectedItem.answer}</Text>
                    {selectedItem.updatedAt && (
                      <Text style={styles.answerTime}>{timeAgo(selectedItem.updatedAt)}</Text>
                    )}
                  </View>
                )}

                <Pressable
                  style={[styles.modalBtn, { backgroundColor: '#E7ECF7', marginTop: 16 }]}
                  onPress={() => setDetailVisible(false)}
                >
                  <Text style={[styles.modalBtnText, { color: '#3A4760' }]}>닫기</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingBottom: 40 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6C7893' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BASE,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFFB8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '900', color: TITLE },
  newBtn: {
    backgroundColor: TINT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  newBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // 통계 카드
  statsWrap: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFFC8',
    backgroundColor: '#FFFFFF99',
  },
  statsInner: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '900', color: TITLE },
  statLabel: { fontSize: 12, color: '#6C7893', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#E8ECF5' },

  // 필터
  filterWrap: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: 16,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8ECF5',
  },
  filterBtnActive: {
    backgroundColor: TINT,
    borderColor: TINT,
  },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6C7893' },
  filterTextActive: { color: '#fff' },

  sectionHint: {
    marginTop: 14,
    marginBottom: 8,
    marginHorizontal: 16,
    fontSize: 12,
    color: '#6C7893',
  },

  // Q&A 카드
  qnaCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFFDA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8ECF5',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  qnaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#EAF1FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE6FF',
  },
  categoryText: { fontSize: 12, fontWeight: '700', color: TINT },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  qnaTitle: { fontSize: 15, fontWeight: '800', color: TITLE, marginBottom: 6 },
  qnaContent: { fontSize: 13, color: '#5C6886', lineHeight: 18 },
  qnaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  qnaTime: { fontSize: 11, color: '#8C97B0' },
  answeredHint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  answeredText: { fontSize: 11, color: ACCENT, fontWeight: '600' },

  // 빈 상태
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFFDA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8ECF5',
    padding: 32,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: '#6C7893', marginTop: 12, marginBottom: 16, textAlign: 'center' },
  emptyBtn: {
    backgroundColor: TINT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#fff', fontWeight: '800' },

  // 모달 공통
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  modalSheet: {
    backgroundColor: '#FFFFFFEE',
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderColor: '#E8ECF5',
  },
  modalTitle: { fontWeight: '900', fontSize: 16, color: TITLE },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontWeight: '900' },

  // 상세 모달
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailBadges: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  detailTitle: { fontSize: 18, fontWeight: '900', color: TITLE, marginBottom: 4 },
  detailTime: { fontSize: 12, color: '#8C97B0', marginBottom: 12 },
  detailContent: { fontSize: 14, color: '#27324A', lineHeight: 22 },

  // 답변 박스
  answerBox: {
    marginTop: 20,
    backgroundColor: '#F2F6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E4EBFF',
    padding: 14,
  },
  answerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  answerLabel: { fontSize: 14, fontWeight: '800', color: TINT },
  adminName: { fontSize: 12, color: '#6C7893', marginBottom: 8 },
  answerContent: { fontSize: 14, color: '#27324A', lineHeight: 20 },
  answerTime: { fontSize: 11, color: '#8C97B0', marginTop: 8 },
});