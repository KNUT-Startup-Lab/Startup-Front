// app/(tabs)/community.tsx - API 연동 버전
import React, { useEffect, useState, useCallback } from 'react';
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
import { CommunityAPI, Post, Comment } from '../../src/api/community';

const BG = '#F6F8FF';
const BASE = '#D6DDFF';
const TITLE = '#0E1420';
const TINT = '#2C6DF7';
const ACCENT = '#13B38D';

export default function CommunityScreen() {
  // 상태
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<{ title: string; content: string } | null>(null);

  // 작성/수정 모달
  const [composeVisible, setComposeVisible] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 데이터 로드
  const fetchData = useCallback(async () => {
    try {
      // 게시글 목록
      const postsRes = await CommunityAPI.getPosts({ limit: 20 });
      setPosts(postsRes.posts || []);

      // 공지사항
      const noticesRes = await CommunityAPI.getNotices({ limit: 1 });
      if (noticesRes.notices && noticesRes.notices.length > 0) {
        const n = noticesRes.notices[0];
        setNotice({ title: n.title, content: n.content });
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // 작성/수정 모달
  const openCompose = (post?: Post) => {
    setEditingPostId(post?.id ?? null);
    setText(post?.content ?? '');
    setComposeVisible(true);
  };

  const closeCompose = () => {
    setComposeVisible(false);
    setText('');
    setEditingPostId(null);
  };

  // 게시글 작성/수정
  const upsertPost = async () => {
    if (!text.trim()) {
      Alert.alert('내용을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      if (editingPostId) {
        await CommunityAPI.updatePost(editingPostId, text.trim());
        Alert.alert('완료', '게시글이 수정되었습니다.');
      } else {
        await CommunityAPI.createPost(text.trim());
        Alert.alert('완료', '게시글이 작성되었습니다.');
      }
      closeCompose();
      fetchData(); // 목록 새로고침
    } catch (error) {
      // 에러는 api client에서 Alert 처리됨
    } finally {
      setSubmitting(false);
    }
  };

  // 게시글 삭제
  const deletePost = (postId: number) => {
    Alert.alert('삭제', '게시글을 삭제할까요?', [
      { text: '취소' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await CommunityAPI.deletePost(postId);
            fetchData();
          } catch (error) {
            // 에러는 api client에서 처리
          }
        },
      },
    ]);
  };

  // 좋아요 토글
  const toggleLike = async (postId: number) => {
    try {
      const res = await CommunityAPI.toggleLike(postId);
      // 로컬 상태 업데이트
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, liked: res.liked, likes: res.totalLikes }
            : p
        )
      );
    } catch (error) {
      // 에러는 api client에서 처리
    }
  };

  // 댓글 작성
  const addComment = async (postId: number, content: string) => {
    if (!content.trim()) return;
    try {
      await CommunityAPI.createComment(postId, content.trim());
      fetchData(); // 새로고침해서 댓글 목록 갱신
    } catch (error) {
      // 에러는 api client에서 처리
    }
  };

  // 시간 표시
  const timeAgo = (dateStr: string) => {
    const t = new Date(dateStr).getTime();
    const diff = Date.now() - t;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${Math.max(1, minutes)}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={TINT} />
          <Text style={styles.loadingText}>불러오는 중...</Text>
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
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>커뮤니티</Text>
          <View style={styles.headerRight}>
            <View style={styles.floorBadge}>
              <Text style={styles.floorText}>2F</Text>
            </View>
            <Ionicons name="notifications-outline" size={18} color={TITLE} />
          </View>
        </View>

        {/* 공지 카드 */}
        {notice && (
          <View style={styles.noticeWrap}>
            <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
            <View style={styles.noticeInner}>
              <View style={styles.noticeIcon}>
                <Ionicons name="megaphone" size={18} color={TINT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeContent}>{notice.content}</Text>
                <Pressable style={styles.noticeLink}>
                  <Text style={{ color: TINT, fontWeight: '800' }}>자세히 보기 →</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* 섹션 타이틀 */}
        <Text style={styles.sectionHint}>층 친구들과 익명으로 대화해요</Text>

        {/* 빈 상태 */}
        {posts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={48} color="#9AA5BD" />
            <Text style={styles.emptyText}>아직 게시글이 없습니다</Text>
            <Pressable style={styles.emptyBtn} onPress={() => openCompose()}>
              <Text style={styles.emptyBtnText}>첫 글 작성하기</Text>
            </Pressable>
          </View>
        ) : (
          // 피드
          posts.map(post => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Ionicons name="person-circle-outline" size={22} color="#93A0B8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postAuthor}>익명</Text>
                  <Text style={styles.postTime}>{timeAgo(post.createdAt)}</Text>
                </View>

                {/* 작성자 전용 메뉴 (userId 비교는 백엔드에서 처리) */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable onPress={() => openCompose(post)} style={styles.iconBtn}>
                    <Ionicons name="create-outline" size={16} color="#6C7893" />
                  </Pressable>
                  <Pressable onPress={() => deletePost(post.id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={16} color="#E25C5C" />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.postText}>{post.content}</Text>

              {/* 액션 바 */}
              <View style={styles.actions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => toggleLike(post.id)}
                >
                  <Ionicons
                    name={post.liked ? 'heart' : 'heart-outline'}
                    size={16}
                    color={post.liked ? '#FF5D7D' : '#6C7893'}
                  />
                  <Text style={styles.actionTxt}>{post.likes}</Text>
                </Pressable>

                <Pressable style={styles.actionBtn}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#6C7893" />
                  <Text style={styles.actionTxt}>{post.comments?.length || 0}</Text>
                </Pressable>
              </View>

              {/* 댓글 목록 */}
              {post.comments?.map(cm => (
                <View key={cm.id} style={styles.commentRow}>
                  <Ionicons name="chatbubble-outline" size={14} color="#9AA5BD" />
                  <Text style={styles.commentText}>{cm.content}</Text>
                  <Text style={styles.commentTime}>{timeAgo(cm.createdAt)}</Text>
                </View>
              ))}

              {/* 댓글 입력 */}
              <InlineCommentInput onSubmit={(txt) => addComment(post.id, txt)} />
            </View>
          ))
        )}
      </ScrollView>

      {/* 플로팅 작성 버튼 */}
      <Pressable style={styles.fab} onPress={() => openCompose()}>
        <Ionicons name="pencil" size={22} color="#fff" />
      </Pressable>

      {/* 작성/수정 모달 */}
      <Modal transparent visible={composeVisible} animationType="slide" onRequestClose={closeCompose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
          <Pressable style={styles.modalBackdrop} onPress={closeCompose} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editingPostId ? '게시글 수정' : '새 글 작성'}</Text>
            <TextInput
              placeholder="내용을 입력하세요"
              placeholderTextColor="#9AA5BD"
              multiline
              value={text}
              onChangeText={setText}
              style={styles.textArea}
              maxLength={500}
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalBtn, { backgroundColor: '#E7ECF7' }]} onPress={closeCompose}>
                <Text style={[styles.modalBtnText, { color: '#3A4760' }]}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: TINT, opacity: submitting ? 0.6 : 1 }]}
                onPress={upsertPost}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnText}>{editingPostId ? '수정' : '작성'}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- 인라인 댓글 입력 컴포넌트 ---------- */
function InlineCommentInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [t, setT] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!t.trim() || sending) return;
    setSending(true);
    await onSubmit(t);
    setT('');
    setSending(false);
  };

  return (
    <View style={styles.inlineWrap}>
      <TextInput
        value={t}
        onChangeText={setT}
        placeholder="댓글을 입력하세요"
        placeholderTextColor="#9AA5BD"
        style={styles.inlineInput}
        maxLength={200}
      />
      <Pressable
        style={[styles.inlineSend, { opacity: t.trim() && !sending ? 1 : 0.5 }]}
        onPress={handleSubmit}
        disabled={!t.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="send" size={16} color="#fff" />
        )}
      </Pressable>
    </View>
  );
}

/* ---------------------- 스타일 ---------------------- */
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

  noticeWrap: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFFC8',
    backgroundColor: '#FFFFFF99',
  },
  noticeInner: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  noticeIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#EAF1FF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#DDE6FF',
  },
  noticeTitle: { fontWeight: '900', color: TITLE, marginBottom: 4 },
  noticeContent: { color: '#5C6886' },
  noticeLink: { marginTop: 8 },

  sectionHint: {
    marginTop: 14,
    marginBottom: 8,
    marginHorizontal: 16,
    fontSize: 12,
    color: '#6C7893',
  },

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

  postCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFFDA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8ECF5',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  avatar: {
    width: 28, height: 28, borderRadius: 999, backgroundColor: '#EEF3FF',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
    borderWidth: 1, borderColor: '#DDE6FF',
  },
  postAuthor: { fontWeight: '800', color: TITLE },
  postTime: { fontSize: 11, color: '#8C97B0' },

  postText: { color: '#27324A', lineHeight: 20, marginTop: 6 },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2F6FF',
    borderWidth: 1,
    borderColor: '#E4EBFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  actionTxt: { color: '#5B6789', fontWeight: '700' },

  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#FFFFFFF0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EDF1FA',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  commentText: { flex: 1, color: '#47516B' },
  commentTime: { fontSize: 10, color: '#9AA5BD' },

  inlineWrap: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  inlineInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8ECF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: TITLE,
  },
  inlineSend: {
    width: 40,
    borderRadius: 10,
    backgroundColor: TINT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fab: {
    position: 'absolute',
    right: 18,
    bottom: 22,
    width: 54, height: 54, borderRadius: 999,
    backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  // 모달
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
  modalTitle: { fontWeight: '900', color: TITLE, marginBottom: 8 },
  textArea: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECF5',
    padding: 12,
    color: TITLE,
    textAlignVertical: 'top',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontWeight: '900' },

  iconBtn: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F3F6FF',
    borderWidth: 1, borderColor: '#E4EBFF',
  },
});