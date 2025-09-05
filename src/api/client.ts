// src/api/client.ts
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Query = Record<string, string | number | boolean | undefined>;

export type ApiOptions = {
  method?: Method;
  body?: any;                  // object | FormData
  auth?: boolean;              // true면 Bearer 토큰 자동 첨부
  query?: Query;               // ?a=1&b=2
  timeoutMs?: number;          // 기본 10초
  headers?: Record<string, string>;
};

/** 공통 API 호출 (에러 팝업 + JSON/텍스트 응답 안전 파싱) */
export async function api<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    auth = false,
    query,
    timeoutMs = 10_000,
    headers: extraHeaders = {},
  } = options;

  // QueryString
  const qs = query
    ? '?' +
      new URLSearchParams(
        Object.entries(query).reduce<Record<string, string>>((acc, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v);
          return acc;
        }, {})
      ).toString()
    : '';

  // 헤더 구성
  const headers: Record<string, string> = { ...extraHeaders };

  // body가 FormData가 아니면 JSON으로 보냄
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }

  // 인증 토큰
  if (auth) {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // AbortController로 타임아웃 처리
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${BASE_URL}${path}${qs}`;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    });

    clearTimeout(to);

    // 응답 파싱: JSON 우선, 실패 시 텍스트로 그대로
    const contentType = res.headers.get('content-type') || '';
    let parsed: any = {};
    let rawText = '';

    try {
      if (contentType.includes('application/json')) {
        parsed = await res.json();
      } else {
        rawText = await res.text(); // HTML/문자열 대응
        parsed = rawText ? JSON.parse(rawText) : {}; // 혹시 json 문자열일 수도 있어서 한 번 시도
      }
    } catch {
      // JSON 파싱 실패 → 텍스트 그대로 보존(예: 서버가 HTML 에러 페이지 반환 시)
      if (!rawText) rawText = await res.text().catch(() => '');
      parsed = { raw: rawText };
    }

    if (!res.ok) {
      const message =
        parsed?.message ||
        parsed?.error ||
        parsed?.raw ||
        `요청 실패 (HTTP ${res.status})`;

      showErrorPopup(message, res.status, url);
      throw new Error(message);
    }

    return parsed as T;
  } catch (err: any) {
    clearTimeout(to);

    // 네트워크 계열 에러 메시지 정리
    let message = '네트워크 오류가 발생했습니다.';
    const em = (err?.message || '').toLowerCase();

    if (err?.name === 'AbortError') {
      message = '요청 시간이 초과되었습니다. 네트워크 상태를 확인하세요.';
    } else if (em.includes('network request failed')) {
      message = '서버에 연결할 수 없습니다. Wi-Fi/IP/포트를 확인하세요.';
    } else if (em.includes('econnrefused')) {
      message = '서버가 응답하지 않습니다. 서버가 켜져 있는지 확인하세요.';
    } else if (em.includes('enotfound') || em.includes('dns')) {
      message = 'API 주소를 찾을 수 없습니다. BASE_URL을 확인하세요.';
    } else if (err instanceof SyntaxError) {
      message = '응답 파싱 중 오류가 발생했습니다. (JSON 형식 아님)';
    }

    showErrorPopup(message, undefined, url);
    throw err;
  }
}

/* ---------------- helpers ---------------- */

function showErrorPopup(message: string, status?: number, url?: string) {
  let title = '오류';
  if (status) {
    if (status >= 500) title = '서버 오류';
    else if (status === 401) title = '인증 오류';
    else if (status === 404) title = '찾을 수 없음';
    else if (status >= 400) title = '요청 오류';
  }
  // 디버깅에 도움되게 URL 한 줄 추가(사용자에겐 거슬리지 않게 줄바꿈 아래)
  const body = url ? `${message}\n\n(${url})` : message;
  Alert.alert(title, body, [{ text: '확인' }], { cancelable: true });
}