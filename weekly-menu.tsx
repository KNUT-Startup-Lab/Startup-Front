import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';

interface MealData {
  id: string;
  date: string;
  breakfast: {
    menu: string[];
    image: string;
  };
  lunch: {
    menu: string[];
    image: string;
  };
  dinner: {
    menu: string[];
    image: string;
  };
}

const WeeklyMenuScreen: React.FC = () => {
  const [weeklyMenu, setWeeklyMenu] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyMenu();
  }, []);

  const fetchWeeklyMenu = async () => {
    try {
      setLoading(true);
      // 백엔드 API 호출
      const response = await fetch('YOUR_API_BASE_URL/api/weekly-menu', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer your-token-here`, // 인증 토큰
        },
      });

      if (!response.ok) {
        throw new Error('메뉴 데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setWeeklyMenu(data);
    } catch (error) {
      console.error('Error fetching weekly menu:', error);
      Alert.alert('오류', '메뉴 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  const MealCard = ({ mealType, meal, date }: { mealType: string, meal: any, date: string }) => (
    <View style={styles.mealCard}>
      <Text style={styles.mealType}>{mealType}</Text>
      <Text style={styles.date}>{formatDate(date)}</Text>
      
      {meal.image && (
        <Image 
          source={{ uri: meal.image }} 
          style={styles.mealImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.menuContainer}>
        {meal.menu.map((item: string, index: number) => (
          <Text key={index} style={styles.menuItem}>• {item}</Text>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>메뉴를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>이번주 식단표</Text>
      
      {weeklyMenu.map((dayMenu) => (
        <View key={dayMenu.id} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{formatDate(dayMenu.date)}</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mealsScroll}>
            <MealCard mealType="조식" meal={dayMenu.breakfast} date={dayMenu.date} />
            <MealCard mealType="중식" meal={dayMenu.lunch} date={dayMenu.date} />
            <MealCard mealType="석식" meal={dayMenu.dinner} date={dayMenu.date} />
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  dayContainer: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  mealsScroll: {
    flexDirection: 'row',
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  mealImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  menuContainer: {
    marginTop: 8,
  },
  menuItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default WeeklyMenuScreen;