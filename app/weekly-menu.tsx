import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface Meal {
  menu: string[];
  image: string;
}

interface MealData {
  id: string;
  date: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

const WeeklyMenuScreen: React.FC = () => {
  const [weeklyMenu, setWeeklyMenu] = useState<MealData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 대원생활관 최신 PNG 첨부 이미지 URL
  const [latestDormImageUrl, setLatestDormImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeklyMenu();
    fetchLatestDormImage();
  }, []);

  // ✅ 너 백엔드 주간 식단 API 호출
  const fetchWeeklyMenu = async () => {
    try {
      setLoading(true);

      const response = await fetch('YOUR_API_BASE_URL/api/weekly-menu', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer your-token-here`,
        },
      });

      if (!response.ok) {
        throw new Error('메뉴 데이터를 불러오는데 실패했습니다.');
      }

      const data: MealData[] = await response.json();
      setWeeklyMenu(data);
    } catch (error) {
      console.error('Error fetching weekly menu:', error);
      Alert.alert('오류', '메뉴 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ut.ac.kr 식단 게시판에서
  //    가장 최근 "대원생활관" 글의 PNG 첨부파일 URL 긁어오기
  const fetchLatestDormImage = async () => {
    try {
      const response = await fetch(
        'https://www.ut.ac.kr/cop/bbs/BBSMSTR_000000000143/selectBoardList.do'
      );

      if (!response.ok) {
        console.warn('게시판 HTML을 불러오지 못했습니다.');
        return;
      }

      const html = await response.text();

      // 1) "대원생활관"이 처음 나오는 위치 (최신 글이 위에 있다는 가정)
      const dormIndex = html.indexOf('대원생활관');
      if (dormIndex === -1) {
        console.warn('대원생활관 글을 찾지 못했습니다.');
        return;
      }

      // 2) 그 이후 부분만 잘라서 첨부파일 다운로드 링크 검색
      const slice = html.slice(dormIndex);

      // (1) 절대경로 형태 (https://www.ut.ac.kr/...FileDown.do?... )
      let match = slice.match(/https?:\/\/[^\s"'<>]*FileDown\.do\?[^"'<>]*/);

      if (match && match[0]) {
        setLatestDormImageUrl(match[0]);
        return;
      }

      // (2) 상대경로 형태 (/cmm/fms/FileDown.do?... ) 인 경우
      match = slice.match(/\/cmm\/fms\/FileDown\.do\?[^"'<>]*/);

      if (match && match[0]) {
        const absoluteUrl = `https://www.ut.ac.kr${match[0]}`;
        setLatestDormImageUrl(absoluteUrl);
        return;
      }

      console.warn('대원생활관 글에서 첨부파일 링크를 찾지 못했습니다.');
    } catch (error) {
      console.error('Error fetching dorm image:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`;
  };

  interface MealCardProps {
    mealType: string;
    meal: Meal;
    date: string;
  }

  const MealCard: React.FC<MealCardProps> = ({ mealType, meal, date }) => (
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
          <Text key={index} style={styles.menuItem}>
            • {item}
          </Text>
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

      {/* 🔹 대원생활관 최신 식단 PNG */}
      {latestDormImageUrl && (
        <View style={styles.dormImageContainer}>
          <Text style={styles.dormImageTitle}>대원생활관 이번주 식단 (PNG)</Text>
          <Image
            source={{ uri: latestDormImageUrl }}
            style={styles.dormImage}
            resizeMode="contain"
          />
        </View>
      )}

      {weeklyMenu.map((dayMenu: MealData) => (
        <View key={dayMenu.id} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{formatDate(dayMenu.date)}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mealsScroll}
          >
            <MealCard
              mealType="조식"
              meal={dayMenu.breakfast}
              date={dayMenu.date}
            />
            <MealCard
              mealType="중식"
              meal={dayMenu.lunch}
              date={dayMenu.date}
            />
            <MealCard
              mealType="석식"
              meal={dayMenu.dinner}
              date={dayMenu.date}
            />
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
  dormImageContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  dormImageTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  dormImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#fff',
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