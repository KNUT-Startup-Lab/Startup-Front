import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';


const BG = '#F6F8FF';
const BASE = '#D6DDFF';
const TITLE = '#0E1420';
const TINT = '#2C6DF7';
const ACCENT = '#13B38D';

type QnAItem = {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  category: string;
  submittedAt: number;
  updatedAt?: number;
  images?: string[];
  answer?: string;
  adminName?: string;
};

const categories = ['에어컨', 'WiFi', '세탁기', '소음', '시설', '기타'];

export default function QnAScreen() {
  const [qnaList, setQnaList] = useState<QnAItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');

  // 작성 모달
  const [composeVisible, setComposeVisible] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    category: '기타',
  });

  // 상세 모달
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QnAItem | null>(null);

  useEffect(() => {
    fetchQnAList();
  }, []);

  const fetchQnAList = async () => {
    try {
      setLoading(true);
      // 임시 목업 데이터
      const mockData: QnAItem[] = [
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
      setQnaList(mockData);
    } catch (error) {
      Alert.alert('오류', 'Q&A를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchQnAList();
  };

  const openCompose = () => {
    setNewQuestion({ title: '', content: '', category: '기타' });
    setComposeVisible(true);
  };

  const closeCompose = () => {
    setComposeVisible(false);
  };

  const submitQuestion = () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    const newItem: QnAItem = {
      id: Math.random().toString(36).slice(2),
      title: newQuestion.title.trim(),
      content: newQuestion.content.trim(),
      status: 'pending',
      category: newQuestion.category,
      submittedAt: Date.now(),
    };

    setQnaList(prev => [newItem, ...prev]);
    Alert.alert('완료', '질문이 등록되었습니다.');
    closeCompose();
  };

  const deleteQuestion = (id: string) => {
    Alert.alert('삭제', '이 질문을 삭제할까요?', [
      { text: '취소' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          setQnaList(prev => prev.filter(item => item.id !== id));
          setDetailVisible(false);
        },
      },
    ]);
  };

  const openDetail = (item: QnAItem) => {
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
    ? qnaList 
    : qnaList.filter(item => item.status === filter);

  const stats = {
    total: qnaList.length,
    pending: qnaList.filter(i => i.status === 'pending').length,
    answered: qnaList.filter(i => i.status === 'answered').length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={TINT} />
          <Text style={styles.loadingText}>Q&A를 불러오는 중...</Text>
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
          <Text style={styles.headerTitle}>Q&A</Text>
          <View style={styles.headerRight}>
            <View style={styles.floorBadge}>
              <Text style={styles.floorText}>2F</Text>
            </View>
            <Ionicons name="notifications-outline" size={18} color={TITLE} />
          </View>
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
        <Text style={styles.sectionHint}>관리자에게 궁금한 점을 질문하세요</Text>

        {/* Q&A 목록 */}
        {filteredList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbox-ellipses-outline" size={48} color="#9AA5BD" />
            <Text style={styles.emptyText}>질문이 없습니다</Text>
            <Pressable style={styles.emptyBtn} onPress={openCompose}>
              <Text style={styles.emptyBtnText}>첫 질문 작성하기</Text>
            </Pressable>
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

      {/* 플로팅 작성 버튼 */}
      <Pressable style={styles.fab} onPress={openCompose}>
        <Ionicons name="help" size={24} color="#fff" />
      </Pressable>

      {/* 질문 작성 모달 */}
      <Modal transparent visible={composeVisible} animationType="slide" onRequestClose={closeCompose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <Pressable style={styles.modalBackdrop} onPress={closeCompose} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>새 질문</Text>

            {/* 카테고리 선택 */}
            <Text style={styles.label}>카테고리</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map(cat => (
                <Pressable
                  key={cat}
                  style={[
                    styles.catBtn,
                    newQuestion.category === cat && styles.catBtnActive,
                  ]}
                  onPress={() => setNewQuestion(prev => ({ ...prev, category: cat }))}
                >
                  <Text style={[
                    styles.catBtnText,
                    newQuestion.category === cat && styles.catBtnTextActive,
                  ]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* 제목 */}
            <Text style={styles.label}>제목</Text>
            <TextInput
              placeholder="질문 제목을 입력하세요"
              placeholderTextColor="#9AA5BD"
              value={newQuestion.title}
              onChangeText={t => setNewQuestion(prev => ({ ...prev, title: t }))}
              style={styles.input}
              maxLength={100}
            />

            {/* 내용 */}
            <Text style={styles.label}>내용</Text>
            <TextInput
              placeholder="질문 내용을 자세히 입력하세요"
              placeholderTextColor="#9AA5BD"
              value={newQuestion.content}
              onChangeText={t => setNewQuestion(prev => ({ ...prev, content: t }))}
              style={styles.textArea}
              multiline
              maxLength={500}
            />

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#E7ECF7' }]} onPress={closeCompose}>
                <Text style={[styles.modalBtnText, { color: '#3A4760' }]}>취소</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: TINT }]} onPress={submitQuestion}>
                <Text style={styles.modalBtnText}>등록</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 질문 상세 모달 */}
      <Modal transparent visible={detailVisible} animationType="slide" onRequestClose={() => setDetailVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
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
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingBottom: 120 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6C7893' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BASE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '900', color: TITLE },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  floorBadge: {
    backgroundColor: '#FFFFFFB8',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FFFFFFE0',
  },
  floorText: { fontWeight: '800', color: TITLE },

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
  emptyText: { fontSize: 14, color: '#6C7893', marginTop: 12, marginBottom: 16 },
  emptyBtn: {
    backgroundColor: TINT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: { color: '#fff', fontWeight: '800' },

  // FAB
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

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
  modalTitle: { fontWeight: '900', fontSize: 16, color: TITLE, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontWeight: '900' },

  // 작성 폼
  label: { fontSize: 13, fontWeight: '700', color: TITLE, marginTop: 12, marginBottom: 6 },
  categoryScroll: { marginBottom: 4 },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F6FF',
    borderWidth: 1,
    borderColor: '#E4EBFF',
    marginRight: 8,
  },
  catBtnActive: { backgroundColor: TINT, borderColor: TINT },
  catBtnText: { fontSize: 13, color: '#5B6789', fontWeight: '600' },
  catBtnTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECF5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TITLE,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECF5',
    padding: 12,
    color: TITLE,
    textAlignVertical: 'top',
    fontSize: 14,
  },

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