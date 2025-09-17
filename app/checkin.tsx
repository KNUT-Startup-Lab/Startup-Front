import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  SafeAreaView, ScrollView, Alert, Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Status = 'none' | 'review' | 'approved' | 'rejected';

const BG = '#F6F8FF';
const TITLE = '#0E1420';
const TINT = '#3662F4';

// 단계별 카드 톤 (파스텔, 더 진하게)
const CARD1_BG = 'rgba(124, 146, 255, 0.14)'; // 블루
const CARD2_BG = 'rgba(17, 179, 141, 0.14)';  // 민트
const CARD3_BG = 'rgba(182, 140, 255, 0.16)'; // 라일락

const CARD_BORDER = 'rgba(255,255,255,0.9)';
const CARD_SHADOW = { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 10 } };

export default function CheckInScreen() {
  const [status, setStatus] = useState<Status>('none');
  const [pickedName, setPickedName] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const progress = useMemo(() => {
    switch (status) {
      case 'none': return 0;
      case 'review': return 0.5;
      case 'approved': return 1;
      case 'rejected': return 0.5;
      default: return 0;
    }
  }, [status]);

  // -------- 업로드 ----------
  const afterPicked = (name: string) => {
    setPickedName(name || '첨부됨');
    setStatus('review'); // 서버 업로드/검토 요청 가정
    Alert.alert('제출됨', '제출이 접수되어 검토가 시작됐어요.');
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('권한 필요', '앨범 접근 권한을 허용해주세요.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      afterPicked(asset?.fileName || asset?.uri?.split('/').pop() || 'image.jpg');
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '사진 선택 실패');
    } finally {
      setPickerOpen(false);
    }
  };

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (res.canceled) return;
      const file = res.assets?.[0];
      afterPicked(file?.name ?? '첨부됨');
    } catch (e: any) {
      Alert.alert('오류', e?.message ?? '파일 선택 실패');
    } finally {
      setPickerOpen(false);
    }
  };

  // 서버에서 반려 신호를 받았다고 가정하면 setStatus('rejected')
  if (status === 'rejected' && !rejectOpen) setRejectOpen(true);

  const goBackHome = () => {
    // 항상 홈 탭으로 복귀 → 탭바 노출
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      {/* 상단 헤더 (뒤로가기 + 타이틀) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBackHome} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={24} color={TITLE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>기숙사 간편 입주 등록</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* STEP 1 */}
        <View style={[styles.card, { backgroundColor: CARD1_BG }, CARD_SHADOW]}>
          <Text style={styles.stepTitle}>STEP_1 건강진단서 제출하기</Text>
          <Text style={styles.desc}>올해 발급된 건강진단서만 유효해요.</Text>
          <Text style={styles.desc}>관리자 승인 후 다음 단계 진행이 가능합니다.</Text>
          <Text style={styles.descSmall}>(행정실 응답시간 기준 약 5분 내외로 승인됩니다.)</Text>

          <View style={styles.rowBetween}>
            <TouchableOpacity style={styles.uploadBtn} onPress={() => setPickerOpen(true)}>
              <Ionicons name="cloud-upload-outline" size={18} color={TITLE} />
              <Text style={styles.uploadText}>제출하기</Text>
            </TouchableOpacity>
            <Text style={styles.fileName} numberOfLines={1}>
              {pickedName ?? '미제출'}
            </Text>
          </View>

          {/* 진행바 */}
          <View style={styles.progressWrap}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          {/* 상태 라벨 */}
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, status === 'none' && styles.progressLabelActive]}>미제출</Text>
            <Text style={[styles.progressLabel, (status === 'review' || status === 'rejected') && styles.progressLabelActive]}>제출검토중</Text>
            <Text style={[styles.progressLabel, status === 'approved' && styles.progressLabelActive]}>승인완료</Text>
          </View>
        </View>

        {/* STEP 2 */}
        <View style={[styles.card, { backgroundColor: CARD2_BG }, CARD_SHADOW]}>
          <Text style={styles.stepTitle}>STEP_2 호실 및 호실 비밀번호 안내</Text>

          {status === 'approved' ? (
            <View style={styles.infoBoxApproved}>
              <Text style={styles.infoLine}><Text style={styles.infoKey}>나의 호실: </Text>A-204</Text>
              <Text style={styles.infoLine}><Text style={styles.infoKey}>호실 비밀번호: </Text>3927</Text>
            </View>
          ) : (
            <View style={styles.infoBoxPending}>
              <Ionicons name="lock-closed-outline" size={16} color="#27455C" />
              <Text style={[styles.infoLine, { color: '#27455C', marginLeft: 6 }]}>승인 후 자동으로 노출됩니다.</Text>
            </View>
          )}
        </View>

        {/* STEP 3 */}
        <View style={[styles.card, { backgroundColor: CARD3_BG }, CARD_SHADOW]}>
          <Text style={styles.stepTitle}>STEP_3 행정실에 방문하여 지문등록하기</Text>
          <Text style={styles.desc}>지문 등록 후 입주 가능합니다. {"\n"}등록 후 자치임원의 안내에 따라주세요.</Text>
        </View>
      </ScrollView>

      {/* 사진/파일 선택 액션시트 */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.sheetDim}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>제출할 항목 선택</Text>
            <TouchableOpacity style={styles.sheetBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={18} color={TITLE} />
              <Text style={styles.sheetBtnText}>사진 선택</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetBtn} onPress={pickDocument}>
              <Ionicons name="document-text-outline" size={18} color={TITLE} />
              <Text style={styles.sheetBtnText}>파일 선택</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sheetBtn, { marginTop: 6 }]} onPress={() => setPickerOpen(false)}>
              <Ionicons name="close-outline" size={20} color="#6B7280" />
              <Text style={[styles.sheetBtnText, { color: '#6B7280' }]}>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 미승인 안내 모달 (서버 반려 시 setStatus('rejected')) */}
      <Modal visible={rejectOpen} transparent animationType="fade" onRequestClose={() => setRejectOpen(false)}>
        <View style={styles.modalDim}>
          <View style={styles.rejectCard}>
            <Text style={styles.rejectTitle}>미승인</Text>
            <Text style={styles.rejectMsg}>사유: 유효기간이 지난 서류입니다.</Text>
            <Text style={styles.rejectMsg}>유효한 서류를 다시 제출하거나 행정실에 문의하세요.</Text>
            <TouchableOpacity onPress={() => setRejectOpen(false)} style={styles.rejectOk}>
              <Text style={styles.rejectOkText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#D6DDFF'
  },
  backBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: TITLE },

  card: {
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },

  stepTitle: { fontWeight: '900', color: TITLE, marginBottom: 8, letterSpacing: 0.2 },
  desc: { color: '#2C3B58', lineHeight: 20 },
  descSmall: { color: '#56658A', marginTop: 4, fontSize: 12 },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12 },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 1, borderColor: '#FFFFFFB5'
  },
  uploadText: { fontWeight: '800', color: TITLE },
  fileName: { flex: 1, textAlign: 'right', color: '#42506E' },

  progressWrap: { height: 10, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.08)', overflow: 'hidden', marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: TINT, borderRadius: 999 },

  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressLabel: { fontSize: 12, color: '#8A93AD', fontWeight: '800' },
  progressLabelActive: { color: TITLE },

  infoBoxApproved: {
    marginTop: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1, borderColor: '#FFFFFFD0', padding: 12
  },
  infoBoxPending: {
    marginTop: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.66)',
    borderWidth: 1, borderColor: '#FFFFFFD0', padding: 12, flexDirection: 'row', alignItems: 'center'
  },
  infoLine: { color: '#223154', fontWeight: '800', marginBottom: 6 },
  infoKey: { color: '#0E1420' },

  sheetDim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFF', paddingHorizontal: 16, paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopLeftRadius: 16, borderTopRightRadius: 16, borderColor: '#F2F2F2', borderWidth: 1
  },
  sheetTitle: { fontWeight: '900', color: TITLE, marginBottom: 10 },
  sheetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F8FAFF', paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1, borderColor: '#EEF2FF', marginTop: 8
  },
  sheetBtnText: { fontWeight: '800', color: TITLE },

  modalDim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', alignItems: 'center', justifyContent: 'center' },
  rejectCard: {
    width: '78%', backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#F2F2F2', alignItems: 'center'
  },
  rejectTitle: { color: '#EF4444', fontWeight: '900', marginBottom: 8 },
  rejectMsg: { color: '#374151', textAlign: 'center', marginBottom: 4 },
  rejectOk: { marginTop: 10, backgroundColor: '#F3F4F6', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10 },
  rejectOkText: { fontWeight: '800', color: '#111827' },
});