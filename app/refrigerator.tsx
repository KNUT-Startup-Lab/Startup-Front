import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface RefrigeratorItem {
  id: string;
  name: string;
  room: string;
  owner: string;
  storedDate: string;
  expiryDate: string;
  status: 'fresh' | 'expiring' | 'expired';
  description?: string;
}

const RefrigeratorScreen: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<RefrigeratorItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // 새 아이템 등록용 상태 (간단하게 텍스트 입력으로 변경)
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    expiryDate: '', // 텍스트로 변경 (예: "2025-01-30")
  });

  useEffect(() => {
    fetchRefrigeratorItems();
  }, []);

  const fetchRefrigeratorItems = async () => {
    try {
      setLoading(true);
      // 임시 목업 데이터
      const mockData: RefrigeratorItem[] = [
        {
          id: '1',
          name: 'Yogurt',
          room: 'Room 204B',
          owner: 'Sarah',
          storedDate: '2025-01-15',
          expiryDate: '2025-01-20',
          status: 'expired',
          description: 'Greek yogurt',
        },
        {
          id: '2',
          name: 'Milk',
          room: 'Room 201A',
          owner: 'Mike',
          storedDate: '2025-01-18',
          expiryDate: '2025-01-25',
          status: 'expiring',
          description: '2% milk',
        },
        {
          id: '3',
          name: 'Sandwich',
          room: 'Room 203C',
          owner: 'Alex',
          storedDate: '2025-01-22',
          expiryDate: '2025-01-30',
          status: 'fresh',
          description: 'Turkey sandwich',
        },
        {
          id: '4',
          name: 'Leftover Pizza',
          room: 'Room 205A',
          owner: 'Emma',
          storedDate: '2025-01-20',
          expiryDate: '2025-01-24',
          status: 'expiring',
          description: 'Pepperoni pizza',
        },
        {
          id: '5',
          name: 'Apple Juice',
          room: 'Room 202B',
          owner: 'Lisa',
          storedDate: '2025-01-21',
          expiryDate: '2025-02-05',
          status: 'fresh',
          description: 'Organic apple juice',
        },
        {
          id: '6',
          name: 'Cheese',
          room: 'Room 204A',
          owner: 'John',
          storedDate: '2025-01-19',
          expiryDate: '2025-01-26',
          status: 'expiring',
          description: 'Cheddar cheese',
        },
      ];
      setItems(mockData);
    } catch (error) {
      console.error('Error fetching refrigerator items:', error);
      Alert.alert('오류', '냉장고 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRefrigeratorItems();
  };

  const addItem = async () => {
    if (!newItem.name.trim()) {
      Alert.alert('알림', '물품명을 입력해주세요.');
      return;
    }

    if (!newItem.expiryDate.trim()) {
      Alert.alert('알림', '유통기한을 입력해주세요. (예: 2025-01-30)');
      return;
    }

    // 날짜 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newItem.expiryDate)) {
      Alert.alert('알림', '유통기한을 올바른 형식으로 입력해주세요. (예: 2025-01-30)');
      return;
    }

    try {
      const expiryDate = new Date(newItem.expiryDate);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status: 'fresh' | 'expiring' | 'expired' = 'fresh';
      if (diffDays < 0) {
        status = 'expired';
      } else if (diffDays <= 3) {
        status = 'expiring';
      }

      const newRefrigeratorItem: RefrigeratorItem = {
        id: Date.now().toString(),
        name: newItem.name,
        room: 'Room A-204',
        owner: '사용자',
        storedDate: today.toISOString().split('T')[0],
        expiryDate: newItem.expiryDate,
        status: status,
        description: newItem.description,
      };

      setItems(prev => [newRefrigeratorItem, ...prev]);
      Alert.alert('성공', '물품이 등록되었습니다.');
      setIsModalVisible(false);
      setNewItem({ name: '', description: '', expiryDate: '' });
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('오류', '물품 등록에 실패했습니다.');
    }
  };

  const deleteItem = (itemId: string) => {
    Alert.alert(
      '물품 삭제',
      '이 물품을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setItems(prev => prev.filter(item => item.id !== itemId));
            Alert.alert('성공', '물품이 삭제되었습니다.');
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh':
        return '#34C759';
      case 'expiring':
        return '#FF9500';
      case 'expired':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (item: RefrigeratorItem) => {
    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
    
    switch (item.status) {
      case 'fresh':
        return 'Fresh';
      case 'expiring':
        return daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Today';
      case 'expired':
        return 'Expired';
      default:
        return item.status;
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getFilterCounts = () => {
    return {
      all: items.length,
      fresh: items.filter(item => item.status === 'fresh').length,
      expiring: items.filter(item => item.status === 'expiring').length,
      expired: items.filter(item => item.status === 'expired').length,
    };
  };

  const filterCounts = getFilterCounts();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>냉장고 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Refrigerator</Text>
        <Ionicons name="notifications-outline" size={24} color="#666" />
      </View>

      {/* 알림 배너 */}
      {filterCounts.expiring > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="time-outline" size={20} color="#FF9500" />
          <Text style={styles.alertText}>{filterCounts.expiring} items expiring this week</Text>
          <Text style={styles.alertSubtext}>Check items below</Text>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 아이템 목록 */}
        {items.map((item) => (
          <View key={item.id} style={[
            styles.itemCard,
            item.status === 'expiring' && styles.expiringCard,
            item.status === 'expired' && styles.expiredCard,
          ]}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{getStatusText(item)}</Text>
              </View>
            </View>
            
            <Text style={styles.itemLocation}>{item.room} • {item.owner}</Text>
            
            <View style={styles.itemDates}>
              <Text style={styles.dateText}>
                Stored: {new Date(item.storedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.dateText}>
                Expires: {new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>

            {item.description && (
              <Text style={styles.itemDescription}>{item.description}</Text>
            )}

            {/* 내 아이템인 경우에만 삭제 버튼 표시 */}
            {item.owner === '사용자' && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteItem(item.id)}
              >
                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                <Text style={styles.deleteButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="archive-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No items found</Text>
            <Text style={styles.emptyStateSubtext}>Add your first item to get started</Text>
          </View>
        )}
      </ScrollView>

      {/* 플로팅 액션 버튼 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* 새 아이템 추가 모달 */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity onPress={addItem}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={newItem.name}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, name: text }))}
              placeholder="e.g. Milk, Sandwich, Yogurt"
              maxLength={50}
            />

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newItem.description}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, description: text }))}
              placeholder="Additional details about the item"
              multiline
              textAlignVertical="top"
              maxLength={200}
            />

            <Text style={styles.label}>Expiry Date * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={newItem.expiryDate}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, expiryDate: text }))}
              placeholder="e.g. 2025-01-30"
              maxLength={10}
            />

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
              <Text style={styles.infoText}>
                Items will be automatically marked as expiring when they have 3 days or less until expiry. Please use YYYY-MM-DD format for dates.
              </Text>
            </View>
          </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  alertText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 8,
    flex: 1,
  },
  alertSubtext: {
    fontSize: 12,
    color: '#1976D2',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  itemCard: {
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
  expiringCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  expiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
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
  itemLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFD6D6',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#FF3B30',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00C896',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
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
    paddingTop: 60,
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
  saveButton: {
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
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 8,
    flex: 1,
  },
});

export default RefrigeratorScreen;