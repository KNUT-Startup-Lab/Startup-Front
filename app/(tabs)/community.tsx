// app/(tabs)/community.tsx
import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const BG = '#F6F8FF';
const BASE = '#D6DDFF';
const TITLE = '#0E1420';
const TINT = '#2C6DF7';
const ACCENT = '#13B38D';

type Comment = {
  id: string;
  userId: string;
  content: string;
  createdAt: number;
};

type Post = {
  id: string;
  userId: string;
  author: string; // '익명' 등
  content: string;
  createdAt: number;
  likes: number;
  likedByMe?: boolean;
  comments: Comment[];
};

// 현재 로그인 사용자(더미)
const CURRENT_USER_ID = 'me-123';

export default function CommunityScreen() {
  // 공지
  const notice = useMemo(
    () => ({
      title: '층 공지',
      content:
        '금요일 21시에 정전 점검 예정입니다. 스터디룸 이용 시 개인 조명 준비해주세요.',
      cta: '자세히 보기',
    }),
    []
  );

  // 더미 글
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 'p1',
      userId: 'u1',
      author: '익명',
      content:
        '2층 세탁기에서 이상한 소음 들리던데요? 관리실에 문의해야 할까요?',
      createdAt: Date.now() - 1000 * 60 * 5,
      likes: 3,
      likedByMe: false,
      comments: [
        {
          id: 'c1',
          userId: 'u2',
          content: '저도 들었어요. 베어링 문제 같아요.',
          createdAt: Date.now() - 1000 * 60 * 3,
        },
      ],
    },
    {
      id: 'p2',
      userId: CURRENT_USER_ID, // 내가 쓴 글
      author: '익명',
      content:
        '분실물: 공용 라운지에서 테디베어 키링 달린 까만 열쇠 잃어버렸습니다 ㅠㅠ',
      createdAt: Date.now() - 1000 * 60 * 25,
      likes: 1,
      likedByMe: true,
      comments: [],
    },
  ]);

  // 작성/수정 모달 상태
  const [composeVisible, setComposeVisible] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [text, setText] = useState('');

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

  const upsertPost = () => {
    if (!text.trim()) {
      Alert.alert('내용을 입력해주세요');
      return;
    }

    if (editingPostId) {
      setPosts(prev =>
        prev.map(p => (p.id === editingPostId ? { ...p, content: text } : p))
      );
    } else {
      const newPost: Post = {
        id: Math.random().toString(36).slice(2),
        userId: CURRENT_USER_ID,
        author: '익명',
        content: text.trim(),
        createdAt: Date.now(),
        likes: 0,
        likedByMe: false,
        comments: [],
      };
      setPosts(prev => [newPost, ...prev]);
    }
    closeCompose();
  };

  const deletePost = (postId: string) => {
    Alert.alert('삭제', '게시글을 삭제할까요?', [
      { text: '취소' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => setPosts(prev => prev.filter(p => p.id !== postId)),
      },
    ]);
  };

  const toggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    const c: Comment = {
      id: Math.random().toString(36).slice(2),
      userId: CURRENT_USER_ID,
      content: content.trim(),
      createdAt: Date.now(),
    };
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, comments: [...p.comments, c] } : p))
    );
  };

  const timeAgo = (t: number) => {
    const m = Math.max(1, Math.floor((Date.now() - t) / 60000));
    return `${m}분 전`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
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

        {/* 공지 카드 (글래스) */}
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
                <Text style={{ color: TINT, fontWeight: '800' }}>{notice.cta} →</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 섹션 타이틀 */}
        <Text style={styles.sectionHint}>층 친구들과 익명으로 대화해요</Text>

        {/* 피드 */}
        {posts.map(post => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Ionicons name="person-circle-outline" size={22} color="#93A0B8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.postAuthor}>{post.author}</Text>
                <Text style={styles.postTime}>{timeAgo(post.createdAt)}</Text>
              </View>

              {/* 작성자 전용 메뉴 */}
              {post.userId === CURRENT_USER_ID && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable onPress={() => openCompose(post)} style={styles.iconBtn}>
                    <Ionicons name="create-outline" size={16} color="#6C7893" />
                  </Pressable>
                  <Pressable onPress={() => deletePost(post.id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={16} color="#E25C5C" />
                  </Pressable>
                </View>
              )}
            </View>

            <Text style={styles.postText}>{post.content}</Text>

            {/* 액션 바 */}
            <View style={styles.actions}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => toggleLike(post.id)}
              >
                <Ionicons
                  name={post.likedByMe ? 'heart' : 'heart-outline'}
                  size={16}
                  color={post.likedByMe ? '#FF5D7D' : '#6C7893'}
                />
                <Text style={styles.actionTxt}>{post.likes}</Text>
              </Pressable>

              <Pressable style={styles.actionBtn}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#6C7893" />
                <Text style={styles.actionTxt}>{post.comments.length}</Text>
              </Pressable>
            </View>

            {/* 댓글 목록 */}
            {post.comments.map(cm => (
              <View key={cm.id} style={styles.commentRow}>
                <Ionicons name="chatbubble-outline" size={14} color="#9AA5BD" />
                <Text style={styles.commentText}>{cm.content}</Text>
                <Text style={styles.commentTime}>{timeAgo(cm.createdAt)}</Text>
              </View>
            ))}

            {/* 댓글 입력(간단) */}
            <InlineCommentInput onSubmit={(txt) => addComment(post.id, txt)} />
          </View>
        ))}

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
              <Pressable style={[styles.modalBtn, { backgroundColor: TINT }]} onPress={upsertPost}>
                <Text style={styles.modalBtnText}>{editingPostId ? '수정' : '작성'}</Text>
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
  return (
    <View style={styles.inlineWrap}>
      <TextInput
        value={t}
        onChangeText={setT}
        placeholder="댓글을 입력하세요"
        placeholderTextColor="#9AA5BD"
        style={styles.inlineInput}
      />
      <Pressable
        style={[styles.inlineSend, { opacity: t.trim() ? 1 : 0.5 }]}
        onPress={() => {
          if (!t.trim()) return;
          onSubmit(t);
          setT('');
        }}
      >
        <Ionicons name="send" size={16} color="#fff" />
      </Pressable>
    </View>
  );
}

/* ---------------------- 스타일 ---------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { paddingBottom: 120 },

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

  // 작성/수정 모달
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