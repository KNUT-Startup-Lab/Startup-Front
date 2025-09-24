import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

interface QnAItem {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  category: string;
  submittedAt: string;
  updatedAt?: string;
  images?: string[];
  answer?: string;
}

const QnAScreen: React.FC = () => {
  const router = useRouter();
  const [qnaList, setQnaList] = useState<QnAItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QnAItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 새 질문 작성용 상태
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    category: '기타',
    images: [] as string[],
  });

  const categories = ['에어컨', 'WiFi', '세탁기', '소음', '시설', '기타'];

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
          answer: 'We have reset the router on your floor. Please try reconnecting.',
        },
      ];
      setQnaList(mockData);
    } catch (error) {
      console.error('Error fetching Q&A list:', error);
      Alert.alert('오류', 'Q&A 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const selectImage = () => {
    // 이미지 선택 기능 (react-native-image-picker 사용)
    Alert.alert('이미지 선택', '이미지 선택 기능이 구현되면 사용할 수 있습니다.');
  };

  const removeImage = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const submitQuestion = async () => {
    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      Alert.alert('알림', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    try {
      // 임시로 목업 데이터에 추가
      const newQnA: QnAItem = {
        id: Date.now().toString(),
        title: newQuestion.title,
        content: newQuestion.content,
        status: 'pending',
        category: newQuestion.category,
        submittedAt: new Date().toISOString(),
        images: newQuestion.images,
      };

      setQnaList(prev => [newQnA, ...prev]);
      Alert.alert('성공', '질문이 등록되었습니다.');
      setIsModalVisible(false);
      setNewQuestion({ title: '', content: '', category: '기타', images: [] });
    } catch (error) {
      console.error('Error submitting question:', error);
      Alert.alert('오류', '질문 등록에 실패했습니다.');
    }
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
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const QnAListItem = ({ item }: { item: QnAItem }) => (
    <TouchableOpacity
      style={styles.qnaItem}
      onPress={() => {
        setSelectedItem(item);
        setIsDetailModalVisible(true);
      }}
    >
      <View style={styles.qnaHeader}>
        <Text style={styles.qnaTitle}>{item.title}</Text>
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Q&A를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Q&A</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ 질문하기</Text>
        </TouchableOpacity>
      </View>

      {/* Q&A 목록 */}
      <FlatList
        data={qnaList}
        renderItem={({ item }) => <QnAListItem item={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* 새 질문 작성 모달 */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelButton}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>새 질문</Text>
            <TouchableOpacity onPress={submitQuestion}>
              <Text style={styles.submitButton}>등록</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* 카테고리 선택 */}
            <Text style={styles.label}>카테고리</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    newQuestion.category === category && styles.categoryButtonSelected
                  ]}
                  onPress={() => setNewQuestion(prev => ({ ...prev, category }))}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    newQuestion.category === category && styles.categoryButtonTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* 제목 입력 */}
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.titleInput}
              value={newQuestion.title}
              onChangeText={(text) => setNewQuestion(prev => ({ ...prev, title: text }))}
              placeholder="질문 제목을 입력하세요"
              maxLength={100}
            />

            {/* 내용 입력 */}
            <Text style={styles.label}>내용</Text>
            <TextInput
              style={styles.contentInput}
              value={newQuestion.content}
              onChangeText={(text) => setNewQuestion(prev => ({ ...prev, content: text }))}
              placeholder="질문 내용을 자세히 입력하세요"
              multiline
              textAlignVertical="top"
            />

            {/* 이미지 첨부 */}
            <View style={styles.imageSection}>
              <Text style={styles.label}>사진 첨부</Text>
              <TouchableOpacity style={styles.imageButton} onPress={selectImage}>
                <Text style={styles.imageButtonText}>📷 사진 추가</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* 질문 상세 보기 모달 */}
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
            <View />
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  submitButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextSelected: {
    color: 'white',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    height: 120,
  },
  imageSection: {
    marginTop: 16,
  },
  imageButton: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  imageButtonText: {
    fontSize: 16,
    color: '#007AFF',
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

export default QnAScreen;