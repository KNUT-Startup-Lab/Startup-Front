// src/api/community.ts
import { api } from './client';

// ============ 타입 정의 ============

export type Comment = {
  id: number;
  userId: string;
  content: string;
  createdAt: string;
};

export type Post = {
  id: number;
  userId: string;
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
};

export type PostListResponse = {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
};

export type PostDetailResponse = {
  post: Post;
  comments: Comment[];
};

export type Notice = {
  id: number;
  floor: number;
  title: string;
  content: string;
  createdAt: string;
};

// ============ API 함수 ============

export const CommunityAPI = {
  // 게시글 목록 조회
  getPosts: (params?: { floor?: number; page?: number; limit?: number }) =>
    api<PostListResponse>('/api/community/posts', {
      method: 'GET',
      query: params,
      auth: true,
    }),

  // 게시글 상세 조회 (댓글 포함)
  getPostDetail: (id: number) =>
    api<PostDetailResponse>(`/api/community/posts/${id}`, {
      method: 'GET',
      auth: true,
    }),

  // 게시글 작성
  createPost: (content: string) =>
    api<{ id: number }>('/api/community/posts', {
      method: 'POST',
      body: { content },
      auth: true,
    }),

  // 게시글 수정
  updatePost: (id: number, content: string) =>
    api<null>(`/api/community/posts/${id}`, {
      method: 'PUT',
      body: { content },
      auth: true,
    }),

  // 게시글 삭제
  deletePost: (id: number) =>
    api<null>(`/api/community/posts/${id}`, {
      method: 'DELETE',
      auth: true,
    }),

  // 좋아요 토글
  toggleLike: (postId: number) =>
    api<{ liked: boolean; totalLikes: number }>(`/api/community/posts/${postId}/like`, {
      method: 'POST',
      auth: true,
    }),

  // 댓글 작성
  createComment: (postId: number, content: string) =>
    api<{ id: number }>(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: { content },
      auth: true,
    }),

  // 댓글 삭제
  deleteComment: (commentId: number) =>
    api<null>(`/api/community/comments/${commentId}`, {
      method: 'DELETE',
      auth: true,
    }),

  // 커뮤니티 공지사항 목록
  getNotices: (params?: { floor?: number; limit?: number }) =>
    api<{ notices: Notice[] }>('/api/community/notices', {
      method: 'GET',
      query: params,
      auth: true,
    }),

  // 커뮤니티 공지사항 상세
  getNoticeDetail: (id: number) =>
    api<Notice>(`/api/community/notices/${id}`, {
      method: 'GET',
      auth: true,
    }),

  // 커뮤니티 공지사항 등록 (관리자용)
  createNotice: (body: { floor: number; title: string; content: string }) =>
    api<{ id: number }>('/api/community/notices', {
      method: 'POST',
      body,
      auth: true,
    }),
};