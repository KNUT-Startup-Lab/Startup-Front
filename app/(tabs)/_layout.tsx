// app/(tabs)/_layout.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  LayoutChangeEvent,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ACTIVE = '#2C6DF7';
const INACTIVE = '#59627C';
const GLASS_BG = 'rgba(255,255,255,0.55)';
const GLASS_BORDER = 'rgba(255,255,255,0.65)';

function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const [wrapW, setWrapW] = useState(0);
  const pillX = useRef(new Animated.Value(0)).current;

  const routes = state.routes;
  const tabCount = routes.length;

  // 여백/치수(알약 삐져나옴 방지용으로 정밀 조정)
  const sidePad = 14;  // 좌우 패딩
  const gap = 8;       // 탭 간 간격
  const TRAY_H = 68;   // 트레이 높이(조금 낮춤)
  const PILL_H = 48;   // 알약 높이(트레이 안쪽으로 100% 수용)
  const PILL_TOP = (TRAY_H - PILL_H) / 2; // 상하 중앙 정렬

  const tabW = useMemo(() => {
    if (wrapW === 0) return 0;
    return (wrapW - sidePad * 2 - gap * (tabCount - 1)) / tabCount;
  }, [wrapW, tabCount]);

  useEffect(() => {
    const to = (tabW + gap) * state.index;
    Animated.spring(pillX, {
      toValue: to,
      useNativeDriver: true,
      stiffness: 220,
      damping: 22,
      mass: 0.8,
    }).start();
  }, [state.index, tabW]);

  const onLayout = (e: LayoutChangeEvent) => setWrapW(e.nativeEvent.layout.width);

  return (
    // ✅ 바텀 보라색 배경 완전 제거 (투명)
    <View pointerEvents="box-none" style={{ paddingBottom: Math.max(insets.bottom - 6, 8), backgroundColor: 'transparent' }}>
      <View style={styles.barWrap} onLayout={onLayout}>
        {/* 글래스 트레이 */}
        <View style={[styles.glassTray, { height: TRAY_H }]}>
          <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.glassBorder} />
        </View>

        {/* 움직이는 알약(하이라이트) — 트레이 안쪽에 정확히 수납 */}
        {tabW > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pillBase,
              {
                top: PILL_TOP,
                left: sidePad,           // 트레이 좌측 패딩과 동일
                width: tabW,
                height: PILL_H,
                transform: [{ translateX: pillX }],
              },
            ]}
          >
            <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
          </Animated.View>
        )}

        {/* 탭 버튼들 */}
        <View style={[styles.tabsRow, { paddingHorizontal: sidePad, height: TRAY_H, columnGap: gap }]}>
          {routes.map((route, idx) => {
            const { options } = descriptors[route.key];

            // Text children에 문자열만 허용
            let labelText: string;
            if (typeof options.tabBarLabel === 'string') labelText = options.tabBarLabel;
            else if (typeof options.title === 'string') labelText = options.title;
            else labelText = route.name;

            const isFocused = state.index === idx;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const icon = options.tabBarIcon?.({
              focused: isFocused,
              color: isFocused ? ACTIVE : INACTIVE,
              size: 24,
            });

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                activeOpacity={0.9}
                style={[styles.tabBtn, { width: tabW, height: TRAY_H }]}
              >
                <View style={styles.tabInner}>
                  {icon}
                  <Text style={[styles.tabText, { color: isFocused ? ACTIVE : INACTIVE }]} numberOfLines={1}>
                    {labelText}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export default function Layout() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 관리자인지 확인
    AsyncStorage.getItem('userEmail').then((email) => {
      setIsAdmin(email === 'admin@test.com');
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // 기본 탭바 숨김
      }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/navi_home.png')}
              style={[styles.icon, { opacity: focused ? 1 : 0.85 }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reservation"
        options={{
          title: '예약',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/navi_res.png')}
              style={[styles.icon, { opacity: focused ? 1 : 0.85 }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="admin"
          options={{
            title: '관리',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name="settings-outline"
                size={24}
                color={focused ? ACTIVE : INACTIVE}
              />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="community"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/navi_com.png')}
              style={[styles.icon, { opacity: focused ? 1 : 0.85 }]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: '마이',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/navi_my.png')}
              style={[styles.icon, { opacity: focused ? 1 : 0.85 }]}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  barWrap: {
    marginHorizontal: 14,
    marginTop: 6,
    // 보라색 바닥 없애고도 입체감 살리는 그림자
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  glassTray: {
    borderRadius: 22,
    overflow: 'hidden',         // ✅ 내부 클리핑 확실
    backgroundColor: GLASS_BG,  // ✅ 보라 바닥 제거 → 유리 느낌만
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: GLASS_BORDER,
  },
  tabsRow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pillBase: {
    position: 'absolute',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: '#FFFFFFAA',
    overflow: 'hidden',        // ✅ 하이라이트 내부도 깔끔
  },
  tabBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabInner: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  icon: { width: 24, height: 24 },
  tabText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
});