import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';

interface MyQnAItem {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  category: string;
  submittedAt: string;
  updatedAt?: string;
  images?: string[];
  answer?: string;
  adminName?: string;
}

const MyQnAScreen: React.FC = () => {
  const router = useRouter();
  const [myQnaList, setMyQnaList] = useState<MyQnAItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MyQnAItem | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'answered'>('all');

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
          title: 'Air conditioner not working in room 204',
          content: 'The AC unit has been making strange noises and not cooling properly for the past two days.',
          status: 'pending',
          category: '에어컨',
          submittedAt: '2025-01-20T10:00:00Z',
        },
        {
          id: '2',
          title: 'WiFi connection issues',
          content: 'Having trouble connecting to WiFi on 2nd floor.',
          status: 'answered',
          category: 'WiFi',
          submittedAt: '2025-01-19T14:30:00Z',
          updatedAt: '2025-01-20T09:00:00Z',
          answer: 'We have reset the router on your floor. Please try reconnecting and let us know if the issue persists.',
          adminName: '관리자',
        },
        {
          id: '3',
          title: 'Laundry machine out of order',
          content: 'Machine #3 on the 2nd floor is not starting. The display shows an error code.',
          status: 'pending',
          category: '세탁기',
          submittedAt: '2025-01-18T16:45:00Z',
        },
      ];
      setMyQnaList(mockData);
    } catch (error) {
      console.error('Error fetching my Q&A list:', error);
      Alert.alert('오류', '내 Q&A 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyQnAList();
  };

  const deleteQnA = async (qnaId: string) => {
    Alert.alert(
      'Q&A 삭제',
      '이 질문을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setMyQnaList(prev => prev.filter(item => item.id !== qnaId));
            Alert.alert('성공', 'Q&A가 삭제되었습니다.');
            setIsDetailModalVisible(false);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'answered':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '답변 대기';
      case 'answered':
        return '답변 완료';
      default:
        return '처리중';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `오늘 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays === 1) {
      return `어제 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };

  const getFilteredList = () => {
    if (filter === 'all') {
      return myQnaList;
    }
    return myQnaList.filter(item => item.status === filter);
  };

  const FilterButton = ({ filterType, title }: { filterType: 'all' | 'pending' | 'answered', title: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterType && styles.filterButtonActive
      ]}
      onPress={() => setFilter(filterType)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterType && styles.filterButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const QnAListItem = ({ item }: { item: MyQnAItem }) => (
    <TouchableOpacity
      style={styles.qnaItem}
      onPress={() => {
        setSelectedItem(item);
        setIsDetailModalVisible(true);
      }}
    >
      <View style={styles.qnaHeader}>
        <Text style={styles.qnaTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <Text style={styles.qnaContent} numberOfLines={2}>{item.content}</Text>
      
      <View style={styles.qnaFooter}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.date}>{formatDate(item.submittedAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const filteredList = getFilteredList();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>내 Q&A를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>내 Q&A</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/qna')}
        >
          <Text style={styles.addButtonText}>+ 새 질문</Text>
        </TouchableOpacity>
      </View>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{myQnaList.length}</Text>
          <Text style={styles.statLabel}>총 질문</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#FF9500' }]}>
            {myQnaList.filter(item => item.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>답변 대기</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#34C759' }]}>
            {myQnaList.filter(item => item.status === 'answered').length}
          </Text>
          <Text style={styles.statLabel}>답변 완료</Text>
        </View>
      </View>

      {/* 필터 버튼들 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <FilterButton filterType="all" title="전체" />
        <FilterButton filterType="pending" title="답변 대기" />
        <FilterButton filterType="answered" title="답변 완료" />
      </ScrollView>

      {/* Q&A 목록 */}
      <FlatList
        data={filteredList}
        renderItem={({ item }) => <QnAListItem item={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {filter === 'all' ? '작성한 질문이 없습니다' : `${getStatusText(filter)} 상태의 질문이 없습니다`}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => router.push('/qna')}
              >
                <Text style={styles.createFirstButtonText}>첫 질문 작성하기</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* 질문 상세 모달 */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsDetailModalVisible(false)}>
              <Text style={styles.cancelButton}>닫기</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>질문 상세</Text>
            {selectedItem && selectedItem.status === 'pending' && (
              <TouchableOpacity onPress={() => deleteQnA(selectedItem.id)}>
                <Text style={styles.deleteButton}>삭제</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedItem && (
            <ScrollView style={styles.modalContent}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedItem.status), alignSelf: 'flex-start' }]}>
                <Text style={styles.statusText}>{getStatusText(selectedItem.status)}</Text>
              </View>
              
              <Text style={styles.detailTitle}>{selectedItem.title}</Text>
              <Text style={styles.detailMeta}>
                {selectedItem.category} • {formatDate(selectedItem.submittedAt)}
              </Text>
              
              <Text style={styles.detailContent}>{selectedItem.content}</Text>
              
              {selectedItem.answer && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answerLabel}>관리자 답변</Text>
                  {selectedItem.adminName && (
                    <Text style={styles.adminName}>답변자: {selectedItem.adminName}</Text>
                  )}
                  <Text style={styles.answerContent}>{selectedItem.answer}</Text>
                  {selectedItem.updatedAt && (
                    <Text style={styles.answerDate}>
                      답변일: {formatDate(selectedItem.updatedAt)}
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  qnaItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  qnaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  qnaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  qnaContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  qnaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  deleteButton: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  detailMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  detailContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  answerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  adminName: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  answerContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  answerDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default MyQnAScreen;