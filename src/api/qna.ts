// src/api/qna.ts
import { api } from './client';

// ============ 타입 정의 ============

export type QnAStatus = 'all' | 'pending' | 'answered';

export type QnAItem = {
  id: number;
  userId: string;
  title: string;
  content: string;
  category: string;
  status: 'pending' | 'answered';
  images?: string[];
  answer?: string;
  adminId?: string;
  adminName?: string;
  createdAt: string;
  updatedAt?: string;
};

export type QnAListResponse = {
  items: QnAItem[];
  total: number;
  page: number;
  limit: number;
};

export type QnACreateRequest = {
  title: string;
  content: string;
  category: string;
  images?: string[];
};

// ============ API 함수 ============

export const QnAAPI = {
  // Q&A 목록 조회 (전체)
  getList: (params?: { status?: QnAStatus; category?: string; page?: number; limit?: number }) =>
    api<QnAListResponse>('/api/qna', {
      method: 'GET',
      query: params,
      auth: true,
    }),

  // 내 Q&A 목록 조회
  getMyList: (params?: { status?: QnAStatus; page?: number; limit?: number }) =>
    api<QnAListResponse>('/api/qna/my', {
      method: 'GET',
      query: params,
      auth: true,
    }),

  // Q&A 상세 조회
  getDetail: (id: number) =>
    api<QnAItem>(`/api/qna/${id}`, {
      method: 'GET',
      auth: true,
    }),

  // Q&A 등록
  create: (body: QnACreateRequest) =>
    api<{ id: number; message: string }>('/api/qna', {
      method: 'POST',
      body,
      auth: true,
    }),

  // Q&A 삭제
  delete: (id: number) =>
    api<null>(`/api/qna/${id}`, {
      method: 'DELETE',
      auth: true,
    }),

  // Q&A 이미지 업로드
  uploadImage: (file: FormData) =>
    api<{ imageUrl: string }>('/api/qna/upload', {
      method: 'POST',
      body: file,
      auth: true,
    }),

  // Q&A 답변 등록 (관리자용)
  submitAnswer: (id: number, answer: string) =>
    api<null>(`/api/qna/${id}/answer`, {
      method: 'POST',
      body: { answer },
      auth: true,
    }),
};