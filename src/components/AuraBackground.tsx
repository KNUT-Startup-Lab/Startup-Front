// src/components/PastelAuraBackground.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions, View } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * 은은하지만 잘 보이는 파스텔 배경.
 * - 두 개의 애니메이션 레이어(큰/작은)가 서로 다른 속도로 부드럽게 이동
 * - 홈의 글래스 UI 뒤에 두면 딱 잘 보임
 */
export default function PastelAuraBackground() {
  // 메인 레이어
  const t1 = useRef(new Animated.Value(0)).current;
  // 세컨드(느린) 레이어
  const t2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(t1, { toValue: 1, duration: 9000, useNativeDriver: true }),
        Animated.timing(t1, { toValue: 0, duration: 9000, useNativeDriver: true }),
      ])
    );

    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(t2, { toValue: 1, duration: 14000, useNativeDriver: true }),
        Animated.timing(t2, { toValue: 0, duration: 14000, useNativeDriver: true }),
      ])
    );

    loop1.start();
    loop2.start();
    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, [t1, t2]);

  const move = (v: Animated.Value, x = 0.25, y = 0.15) => ({
    transform: [
      {
        translateX: v.interpolate({
          inputRange: [0, 1],
          outputRange: [0, width * x],
        }),
      },
      {
        translateY: v.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -height * y],
        }),
      },
    ],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>

      {/* 커다란 글로우 레이어 (조금 더 진한 파스텔) */}
      <Animated.View style={[styles.layer, move(t1, 0.25, 0.18)]}>
        <View style={[styles.glow, { backgroundColor: 'rgba(214,221,255,0.75)', top: -120, left: -60, width: 460, height: 460 }]} />
        <View style={[styles.glow, { backgroundColor: 'rgba(200,255,230,0.65)', top: 180, left: 40, width: 420, height: 420 }]} />
        <View style={[styles.glow, { backgroundColor: 'rgba(255,210,240,0.70)', top: 40, left: 240, width: 380, height: 380 }]} />
      </Animated.View>

      {/* 작은 글로우 레이어 (느리게, 대비감 보조) */}
      <Animated.View style={[styles.layer, move(t2, -0.18, 0.12)]}>
        <View style={[styles.glow, { backgroundColor: 'rgba(255,240,200,0.65)', top: 260, left: -100, width: 320, height: 320 }]} />
        <View style={[styles.glow, { backgroundColor: 'rgba(180,220,255,0.55)', top: 10, left: 180, width: 280, height: 280 }]} />
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -2, // 콘텐츠 뒤로
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 1,
    // 부드러운 확산감
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 8 },
  },
});